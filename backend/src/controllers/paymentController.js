const prisma = require('../utils/prismaClient');
//const  calculateBalance = require('../utils/calculateBalance');
//const { fetchBalanceData, calculateBalance } = require('../utils/calculateBalance');
const { validationResult } = require('express-validator');
const { DateTime } = require('luxon'); // For date handling
//const FeesUtility = require('../utils/FeeUtility');
const QRCode = require('qrcode');
const SchoolDataService = require('../utils/schoolDataService');
//const StudentFeeService = require('../utils/studentFeeService');
const { Parser } = require('json2csv');
const calculateStudentBalance = require('../utils/CalculateFeeBalance');


const newPayment = async (req, res) => {
    const { studentId, method, code } = req.body;
    const amount = parseFloat(req.body.amount);
    const schoolId = req.user.schoolId;

    if (!studentId || !amount || !method) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (amount <= 0) {
        return res.status(400).json({ error: 'Payment amount must be greater than 0' });
    }

    if ((method === 'Mpesa' || method === 'Bank') && !code) {
        return res.status(400).json({ error: `${method} payments require a transaction code` });
    }

    const transaction = await prisma.$transaction(async (prisma) => {
        // Check current term
        const currentTerm = await prisma.term.findFirst({
            where: { current: true, schoolId, endDate: { gte: new Date() } }
        });

        if (!currentTerm) {
            throw new Error('No active term found.');
        }

        balanceData = await calculateStudentBalance(schoolId, studentId, currentTerm.id);

        // Handle Mpesa transaction if applicable
        if (method === 'Mpesa' || method === 'Bank') {
            const existingTransaction = await prisma.mpesaTransaction.findUnique({ where: { code } });
            if (existingTransaction) {
                throw new Error(`${method} Transaction code already used.`);
            }

            await prisma.mpesaTransaction.create({
                data: { code, amount, verified: false }
            });
        }

        // Create payment
        const payment = await prisma.feePayment.create({
            data: {
                method,
                amount,
                code: (method === 'Mpesa' || method === 'Bank') ? code : null,
                balance: balanceData.currentBalance - amount,
                schoolId,
                studentId,
                payDate: new Date(),
                termId: currentTerm.id
            }
        });

        // Update student's carry forward balance
        await prisma.student.update({
            where: { id_schoolId: { id: studentId, schoolId } },
            data: { cfBalance: Math.max(0, balanceData.currentBalance - amount) }
        });

        return payment;
    });

    return res.status(200).json({
        message: 'Payment processed successfully',
        payment: transaction,
        redirectUrl: `/receipt/${studentId}/${transaction.id}`
    });
};


const printReceipt = async (req, res) => {
    const { studentId, paymentId } = req.params;
    const schoolId = req.user.schoolId;

    try {
        // Fetch student and school details
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: { school: true }
        });

        if (!student) {
            return res.status(404).json({ message: 'Student not found.' });
        }

        const school = await prisma.school.findUnique({ where: { id: schoolId } });
        const currentTerm = await prisma.term.findFirst({
            where: { current: true, schoolId }
        });

        if (!currentTerm) {
            return res.status(400).json({ message: 'Current term not set for the school.' });
        }

        // Use StudentFeeService for balance calculation
    
        const balanceData = await calculateStudentBalance(schoolId, studentId, currentTerm.id);

        if (parseInt(paymentId) === 0) {
            // Generate fee statement
            const payments = await prisma.feePayment.findMany({
                where: { studentId },
                orderBy: { payDate: 'asc' }
            });

            const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);

            return res.json({
                type: 'fee_statement',
                school: {
                    name: school.name,
                    contacts: school.contacts
                },
                student: {
                    id: student.id,
                    name: student.fullName
                },
                termDetails: currentTerm,
                payments,
                totalPaid: balanceData.totalPaid,
                balance: balanceData.currentBalance,
                feeBreakdown: {
                    standardFees: balanceData.standardFees,
                    additionalFees: balanceData.additionalFees,
                    cfBalance: balanceData.cfBalance,
                    totalBilled: balanceData.totalBilled
                }
            });
        } else {
            // Generate receipt for a specific payment
            const payment = await prisma.feePayment.findUnique({
                where: { id: parseInt(paymentId) }
            });

            if (!payment) {
                return res.status(404).json({ message: 'Payment not found.' });
            }

            const qrUrl = `${process.env.BASE_URL}/api/payments/student/${studentId}/receipt/0`;
            const qrCode = await QRCode.toDataURL(qrUrl);

            return res.json({
                type: 'single_payment_receipt',
                school: {
                    name: school.name,
                    contacts: school.contacts
                },
                student: {
                    id: student.id,
                    name: student.fullName
                },
                termDetails: currentTerm,
                payment,
                qrCode,
                balance: balanceData.currentBalance,
                feeBreakdown: {
                    standardFees: balanceData.standardFees,
                    additionalFees: balanceData.additionalFees,
                    cfBalance: balanceData.cfBalance,
                    totalBilled: balanceData.totalBilled
                }
            });
        }
    } catch (error) {
        console.error('Error generating receipt:', error);
        return res.status(500).json({ message: 'An error occurred while generating the receipt.' });
    }
};

const studentPayments = async (req, res) => {
    const gradeFilter = req.query.grade || 'all';
    const streamFilter = req.query.stream || 'all';
    const termFilter = req.query.term || 'current';
    const page = parseInt(req.query.page) || 1;
    const perPage = 15;
    const schoolId = req.user.schoolId;

    try {
        let termId;

        if (termFilter === 'current') {
            const currentTerm = await prisma.term.findFirst({ where: { current: true, schoolId } });
            if (!currentTerm) {
                return res.status(400).json({ message: 'No active term found for this school.' });
            }
            termId = currentTerm.id;
        } else {
            termId = parseInt(termFilter);
        }

        const studentFilters = {
            schoolId,
            active: true,
            ...(gradeFilter !== 'all' && { gradeId: parseInt(gradeFilter) }),
            ...(streamFilter !== 'all' && { streamId: parseInt(streamFilter) })
        };

        const students = await prisma.student.findMany({
            where: studentFilters,
            skip: (page - 1) * perPage,
            take: perPage,
            include: { grade: true, stream: true }
        });

        const totalStudents = await prisma.student.count({ where: studentFilters });

        const studentPaymentDetails = await Promise.all(
            students.map(async (student) => {
                const balanceData = await calculateStudentBalance(schoolId, student.id, termId);
                const balance = balanceData.currentBalance;

                return {
                    id: student.id,
                    fullName: student.fullName,
                    grade: student.grade.name,
                    gradeId: student.grade.id,
                    stream: student.stream?.name || 'N/A',
                    totalPaid: balanceData.paidAmount,
                    balance
                };
            })
        );

        const validGradeIds = studentPaymentDetails
            .map((s) => s.gradeId)
            .filter((id) => id !== undefined);

        const streams = await prisma.stream.findMany({
            where: {
                gradeId: { in: validGradeIds }
            }
        });

        res.json({
            students: studentPaymentDetails,
            filters: {
                grades: await prisma.grade.findMany({ where: { schoolId } }),
                terms: await prisma.term.findMany({ where: { schoolId } }),
                streams
            },
            pagination: {
                page,
                perPage,
                total: totalStudents,
                totalPages: Math.ceil(totalStudents / perPage)
            }
        });
    } catch (error) {
        console.error('Error fetching students payments:', error);
        res.status(500).json({ message: 'Failed to fetch students payments.' });
    }
};

const getStudentsWithFilters = async (req, res) => {
    const { schoolId } = req.user.schoolId; //  schoolId is extracted from the authenticated user.
    const { page = 1, limit = 10, gradeId, streamId, feeId } = req.query; // Pagination and filters

    try {
        const schoolDataService = new SchoolDataService(schoolId);
        const pageNumber = parseInt(page, 10);
        const pageSize = parseInt(limit, 10);
        const skip = (pageNumber - 1) * pageSize;

        // Fetch grades for the school
        const { grades, streams } = await schoolDataService.getGradesAndStreams();

        // Fetch additional fees for the school
        const additionalFees = await prisma.additionalFee.findMany({
            where: { schoolId },
            select: {
                id: true,
                feeName: true,
                amount: true,
            },
        });

        // Build filters
        const filters = {
            schoolId,
        };
        if (gradeId) {
            filters.gradeId = parseInt(gradeId, 10);
        }
        if (streamId) {
            filters.streamId = parseInt(streamId, 10);
        }
        if (feeId) {
            filters.additionalFees = {
                some: { id: parseInt(feeId, 10) },
            };
        }

        // Fetch students with pagination and filters
        const [students, totalStudents] = await Promise.all([
            prisma.student.findMany({
                where: filters,
                skip,
                take: pageSize,
                include: {
                    grade: true,
                    stream: true,
                    additionalFees: true, // Include additional fees to count them
                },
            }),
            prisma.student.count({
                where: filters,
            }),
        ]);

        // Add additional fees count to each student
        const studentsWithFeesCount = students.map((student) => ({
            ...student,
            additionalFeesCount: student.additionalFees.length,
        }));

        // Calculate total pages
        const totalPages = Math.ceil(totalStudents / pageSize);
        console.log('Total students:', totalStudents);
        console.log('Total pages:', totalPages);
        console.log('Students:', studentsWithFeesCount);
        console.log('Filters:', filters);

        // Respond with data
        res.json({
            metadata: {
                page: pageNumber,
                limit: pageSize,
                totalStudents,
                totalPages,
            },
            filters: {
                grades,
                streams,
                additionalFees,
            },
            students: studentsWithFeesCount,
        });
    } catch (error) {
        console.error('Error fetching students with filters:', error);
        res.status(500).json({ error: 'Failed to fetch students.' });
    }
};


const getAllPayments = async (req, res) => {
    // Check for valid user authentication
    if (!req.user || typeof req.user.schoolId !== 'number') {
        return res.status(401).json({ 
            status: 'error',
            message: 'User not properly authenticated' 
        });
    }

    try {
        // Get pagination parameters from query string with validation
        const page = Math.max(1, parseInt(req.query.page) || 1);
        const limit = Math.min(100, Math.max(1, parseInt(req.query.limit) || 10));
        const offset = (page - 1) * limit;

        // Initialize SchoolDataService with the authenticated user's schoolId
        const schoolDataService = new SchoolDataService(req.user.schoolId);

        // Get payments and total count - currentTerm check is handled within getRecentPayments
        const [payments, totalCount] = await Promise.all([
            schoolDataService.getRecentPayments(limit, offset),
            prisma.feePayment.count({
                where: { 
                    schoolId: req.user.schoolId,
                    term: {
                        current: true
                    }
                }
            })
        ]);

        // Check if we got any payments
        if (!payments || payments.length === 0) {
            return res.status(200).json({
                status: 'success',
                data: {
                    payments: [],
                    pagination: {
                        currentPage: page,
                        totalPages: 0,
                        totalItems: 0,
                        itemsPerPage: limit,
                        hasNextPage: false,
                        hasPreviousPage: false
                    }
                }
            });
        }

        // Calculate pagination metadata
        const totalPages = Math.ceil(totalCount / limit);
        const hasNextPage = page < totalPages;
        const hasPreviousPage = page > 1;

        // Send successful response
        return res.status(200).json({
            status: 'success',
            data: {
                payments,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalItems: totalCount,
                    itemsPerPage: limit,
                    hasNextPage,
                    hasPreviousPage
                }
            }
        });

    } catch (error) {
        console.error('Error in getAllPayments:', error);
        // If the error is about no current term, send a specific message
        if (error.message === 'No active term found for this school') {
            return res.status(400).json({
                status: 'error',
                message: 'No current term found for this school'
            });
        }
        return res.status(500).json({
            status: 'error',
            message: 'An unexpected error occurred',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const exportPayments = async (req, res) => {
    if (!req.user || typeof req.user.schoolId !== 'number') {
        return res.status(401).json({ 
            status: 'error',
            message: 'User not properly authenticated' 
        });
    }

    try {
        const schoolDataService = new SchoolDataService(req.user.schoolId);
        
        // Get all payments for current term
        const payments = await schoolDataService.getAllPaymentsForExport();

        // Define fields for CSV
        const fields = [
            {
                label: 'Student Name',
                value: 'student.fullName'
            },
            {
                label: 'Grade',
                value: 'student.grade.name'
            },
            {
                label: 'Amount',
                value: 'amount'
            },
            {
                label: 'Payment Method',
                value: 'method'
            },
            {
                label: 'Payment Code',
                value: 'code'
            },
            {
                label: 'Payment Date',
                value: row => new Date(row.payDate).toLocaleDateString()
            },
            {
                label: 'Status',
                value: row => row.isVerified ? 'Verified' : 'Pending'
            }
        ];

        const json2csvParser = new Parser({ fields });
        const csv = json2csvParser.parse(payments);

        // Set headers for file download
        res.setHeader('Content-Type', 'text/csv');
        res.setHeader('Content-Disposition', `attachment; filename=payments-${new Date().toISOString().split('T')[0]}.csv`);

        return res.status(200).send(csv);

    } catch (error) {
        console.error('Error exporting payments:', error);
        return res.status(500).json({
            status: 'error',
            message: 'Failed to export payments',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const feeReports = async (req, res) => {
    const schoolId = req.user.schoolId;
    const schoolDataService = new SchoolDataService(schoolId);
    
    try {
        // Get all fee report data using the service
        const reportData = await schoolDataService.getFeeReportData();

        return res.json({
            success: true,
            data: reportData
        });

    } catch (error) {
        console.error('Error generating fee reports:', error);
        return res.status(error.message.includes('No active term') ? 400 : 500).json({ 
            success: false,
            message: error.message || 'An error occurred while generating fee reports.',
            error: error.stack || undefined
        });
    }
};

const getStudentFeeStatement = async (req, res) => {
    console.log('/// Starting getStudentFeeStatement controller');
    const { studentId } = req.params;
    const schoolId = req.user.schoolId;
    console.log('Request params:', { studentId, schoolId });

    try {
        console.log(`🔍 Fetching student fee statement for ${studentId}`);
        // Initialize SchoolDataService with the authenticated user's schoolId
        const schoolDataService = new SchoolDataService(schoolId);

        // Get current term
        const currentTerm = await schoolDataService.getCurrentTerm();
        if (!currentTerm) {
            throw new Error('No active term found');
        }
        console.log('📅 Current Term:', currentTerm);

        // Fetch student details
        const student = await schoolDataService.getStudentDetails(studentId);
        console.log('👩‍🎓 Student Details:', student);

        // Fetch fee structure for the grade
        const feeStructure = await schoolDataService.getGradeFeeStructure(student.gradeId, currentTerm.id);
        if (!feeStructure) {
            throw new Error('Fee structure not found for this grade');
        }

        // Calculate balance using the utility function
        const balanceData = await calculateStudentBalance(schoolId, studentId, currentTerm.id);
        console.log('💰 Balance Data:', balanceData);

        // Get payments for the current term
        const payments = await prisma.feePayment.findMany({
            where: {
                studentId,
                termId: currentTerm.id,
                schoolId
            },
            orderBy: { payDate: 'asc' }
        });
        console.log('💳 Payments:', payments);

        // Prepare the fee statement
        const statement = {
            termInfo: {
                id: currentTerm.id,
                name: currentTerm.name
            },
            studentInfo: {
                id: student.id,
                name: student.fullName,
                grade: student.grade.name,
                stream: student.stream.name,
                status: student.active ? 'Active' : 'Inactive'
            },
            billing: {
                regularFees: {
                    total: balanceData.standardFees,
                    breakdown: {
                        tuitionFee: feeStructure.tuitionFee,
                        assessmentBooks: feeStructure.assBooks,
                        diaryFee: feeStructure.diaryFee,
                        activityFee: feeStructure.activityFee,
                        others: feeStructure.others
                    }
                },
                additionalFees: student.additionalFees.map(fee => ({
                    name: fee.feeName,
                    amount: fee.amount
                })),
                totalBilled: balanceData.totalBilled,
                carriedForwardBalance: balanceData.cfBalance
            },
            payments: payments.map(payment => ({
                date: payment.payDate,
                method: payment.method,
                amount: payment.amount,
                code: payment.code,
                runningBalance: payment.balance
            })),
            summary: {
                totalRegularFees: balanceData.standardFees,
                totalAdditionalFees: balanceData.additionalFees,
                totalBilled: balanceData.totalBilled,
                totalPaid: balanceData.totalPaid,
                carriedForwardBalance: balanceData.cfBalance,
                currentBalance: balanceData.currentBalance
            }
        };

        console.log('✅ Fee statement generated successfully');
        return res.status(200).json({ success: true, data: statement });

    } catch (error) {
        console.error('❌ Error in fee statement controller:', error.message);
        
        const errorResponse = {
            success: false,
            error: error.message
        };

        // Map specific errors to appropriate responses
        const errorMap = {
            'Student not found': {
                status: 400,
                message: 'Student not found. Please check the student ID and try again.'
            },
            'No active term found': {
                status: 400,
                message: 'No active term found. Please ensure the school has set an active term.'
            },
            'Fee structure not found for this grade': {
                status: 400,
                message: 'Fee structure missing for this grade and term. Please contact administration.'
            }
        };

        const mappedError = errorMap[error.message];
        if (mappedError) {
            return res.status(mappedError.status).json({ 
                ...errorResponse, 
                error: mappedError.message 
            });
        }

        return res.status(500).json({ 
            ...errorResponse, 
            error: 'Internal Server Error. Please try again later.', 
            details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        });
    }
};

/*
// Fetches student payments with balance and carry-forward balance for the current term.
// GET /api/payments/student_payments
//
const studentPayments = async (req, res) => {
    const gradeFilter = req.query.grade || 'all';
    const streamFilter = req.query.stream || 'all';
    const page = parseInt(req.query.page) || 1;
    const perPage = 15;
    const schoolId = req.user.schoolId; // Assuming req.user is set by authentication middleware

    try {
        // Fetch the current term for the school
        const currentTerm = await prisma.term.findFirst({
            where: { current: true, schoolId }
        });

        if (!currentTerm) {
            return res.status(400).json({ message: 'Current term not found for this school.' });
        }

        // Query students with filters for grade and stream
        let studentQuery = {
            schoolId,
            isActive: true
        };
        if (gradeFilter !== 'all') {
            studentQuery.gradeId = parseInt(gradeFilter);
        }
        if (streamFilter !== 'all') {
            studentQuery.streamId = parseInt(streamFilter);
        }

        // Fetch paginated students
        const studentsPaginated = await prisma.student.findMany({
            where: studentQuery,
            skip: (page - 1) * perPage,
            take: perPage,
            include: {
                grade: true,
                stream: true
            }
        });

        // Get the total count for pagination
        const totalStudents = await prisma.student.count({
            where: studentQuery
        });

        const studentPaymentDetails = [];

        // Fetch payment details for each student
        for (const student of studentsPaginated) {
            // Calculate total paid for the current term
            const totalPaid = await prisma.feePayment.aggregate({
                where: {
                    studentId: student.student_id,
                    termId: currentTerm.id
                },
                _sum: { amount: true }
            }).then(result => result._sum.amount || 0.0);

            // Calculate balance and carry-forward balance
            try {
                const { balance, carryForwardBalance } = await calculateBalance(student.student_id);
                studentPaymentDetails.push({
                    student,
                    cf_balance: carryForwardBalance,
                    total_paid: totalPaid,
                    balance
                });
            } catch (error) {
                console.error(`Error calculating balance for student ${student.student_id}:`, error);
                return res.status(400).json({ message: error.message || 'Error calculating balance.' });
            }
        }

        // Fetch all grades and streams for filter options
        const grades = await prisma.grade.findMany({
            where: { schoolId }
        });
        const streams = await prisma.stream.findMany({
            where: { gradeId: { in: grades.map(grade => grade.id) } }
        });

        // Respond with paginated data and filters
        res.json({
            student_payment_details: studentPaymentDetails,
            current_term: currentTerm,
            grades,
            streams,
            selected_grade: gradeFilter,
            selected_stream: streamFilter,
            pagination: {
                page,
                perPage,
                total: totalStudents,
                totalPages: Math.ceil(totalStudents / perPage)
            }
        });

    } catch (error) {
        console.error('Error fetching student payments:', error);
        res.status(500).json({ message: 'An error occurred while fetching student payments.' });
    }
};


 * Generates a receipt or fee statement for a student.
 * GET /api/payments/student/:studentId/receipt/:paymentId
 
const printReceipt = async (req, res) => {
    const { studentId, paymentId } = req.params;
    const schoolId = req.user.schoolId;  // Assume this is set by an auth middleware

    try {
        // Fetch student data
        const student = await prisma.student.findUnique({
            where: { student_id: studentId }
        });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Fetch current term for the school
        const currentTerm = await prisma.term.findFirst({
            where: { current: true, schoolId }
        });
        if (!currentTerm) {
            return res.status(400).json({ message: 'Current term not set for the school.' });
        }

        // Fetch school details
        const school = await prisma.school.findUnique({
            where: { id: schoolId }
        });

        // Generate a fee statement (multiple payments) if paymentId is 0
        if (parseInt(paymentId) === 0) {
            const payments = await prisma.feePayment.findMany({
                where: { studentId },
                orderBy: { pay_date: 'asc' }
            });

            const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
            const { balance, carryForwardBalance } = await calculateBalance(studentId);

            return res.json({
                type: 'fee_statement',
                student,
                payments,
                balance,
                carryForwardBalance,
                totalPaid,
                currentTerm,
                school
            });
        } else {
            // Generate a single payment receipt if paymentId is not 0
            const payment = await prisma.feePayment.findUnique({
                where: { id: parseInt(paymentId) }
            });
            if (!payment) {
                return res.status(404).json({ message: 'Payment not found' });
            }

            const { balance, carryForwardBalance } = await calculateBalance(studentId);

            // Generate a QR code with a link to the full fee statement
            const feeStatementUrl = `${process.env.BASE_URL}/api/payments/student/${studentId}/receipt/0`;
            const qrCode = await QRCode.toDataURL(feeStatementUrl);

            return res.json({
                type: 'single_payment_receipt',
                student,
                payment,
                balance,
                carryForwardBalance,
                currentTerm,
                school,
                qrCode
            });
        }
    } catch (error) {
        console.error('Error generating receipt:', error);
        res.status(500).json({ message: 'An error occurred while generating the receipt.' });
    }
};


 * Fetches all recent payments for the current school.
 * GET /api/payments/recent_payments
 
const viewAllPayments = async (req, res) => {
    const schoolId = req.user.schoolId;

    try {
        const schoolDataService = new SchoolDataService(schoolId);
        const allPayments = await schoolDataService.getRecentPayments(); // Call without limit to fetch all

        res.json({ payments: allPayments });
    } catch (error) {
        console.error('Error fetching all payments:', error);
        res.status(500).json({ message: 'An error occurred while fetching all payments.' });
    }
}


 * Generates fee reports for the school, including payment and term comparisons.
 * GET /api/payments/fee_reports
 
const feeReports = async (req, res) => {
    const schoolId = req.user.schoolId; // Assume req.user is populated by authentication middleware
  
    try {
      // Fetch the current term
      const currentTerm = await prisma.term.findFirst({
        where: { current: true, schoolId },
      });
  
      if (!currentTerm) {
        return res.status(400).json({ message: 'Current term not set for the school.' });
      }
  
      // Fetch the previous term (if any) that ended before the current term started
      const previousTerm = await prisma.term.findFirst({
        where: { schoolId, endDate: { lt: currentTerm.startDate } },
        orderBy: { endDate: 'desc' },
      });
  
      // Fetch all grades for the school
      const grades = await prisma.grade.findMany({
        where: { schoolId },
      });
  
      // Prepare grade details with fee information and additional fees
      const gradeDetails = [];
      for (const grade of grades) {
        const gradeInfo = await FeesUtility.getGradeInfo(grade, currentTerm, schoolId);
        const additionalFeesInfo = await FeesUtility.getAdditionalFeesInfo(grade, currentTerm, schoolId);
        gradeDetails.push({ ...gradeInfo, additional_fees: additionalFeesInfo });
      }
  
      // Get comparisons for payment methods, term totals, and additional fees
      const paymentMethodComparison = await FeesUtility.getPaymentMethodComparison(
        currentTerm,
        previousTerm,
        schoolId
      );
      const termComparison = await FeesUtility.getTermComparison(
        currentTerm,
        previousTerm,
        schoolId
      );
      const additionalFeesComparison = await FeesUtility.getAdditionalFeesComparison(
        currentTerm,
        previousTerm,
        schoolId
      );
  
      // Send the JSON response with all the report data
      res.json({
        gradeDetails,
        paymentMethodComparison,
        termComparison,
        additionalFeesComparison,
      });
    } catch (error) {
      console.error('Error generating fee reports:', error);
      res.status(500).json({ message: 'An error occurred while generating fee reports.' });
    }
};


 * Searches student payments based on query and returns results with payment details.
 * GET /api/payments/search_student_payments?q=searchTerm
 
const searchStudentPayments = async (req, res) => {
    const query = req.query.q || '';
    const schoolId = req.user.schoolId; // Assume req.user is populated by authentication middleware

    if (!query) {
        return res.json([]);
    }

    try {
        // Fetch students matching the search query in the current school who are active
        const students = await prisma.student.findMany({
            where: {
                full_name: {
                    contains: query,
                    mode: 'insensitive'
                },
                schoolId: schoolId,
                isActive: true
            },
            include: {
                grade: true // To fetch the grade name
            }
        });

        // Fetch the current term for the school
        const currentTerm = await prisma.term.findFirst({
            where: { current: true, schoolId }
        });

        if (!currentTerm) {
            return res.status(400).json({ message: 'Current term not set for this school.' });
        }

        const suggestions = [];

        // Iterate over each student to gather payment information
        for (const student of students) {
            // Calculate the total paid by the student for the current term
            const totalPaid = await prisma.feePayment.aggregate({
                where: { studentId: student.student_id, termId: currentTerm.id },
                _sum: { amount: true }
            }).then(result => result._sum.amount || 0.0);

            // Calculate balance and carry-forward balance using helper function
            try {
                const { balance, carryForwardBalance } = await calculateBalance(student.student_id);

                suggestions.push({
                    id: student.student_id,
                    name: student.full_name,
                    grade: student.grade.name,
                    cf_balance: carryForwardBalance,
                    total_paid: totalPaid,
                    balance
                });
            } catch (error) {
                console.warn(`Error calculating balance for student ${student.student_id}:`, error);
                // Continue to the next student if there is an error in calculating balance
            }
        }

        // Return the JSON response with search suggestions
        res.json(suggestions);

    } catch (error) {
        console.error('Error searching student payments:', error);
        res.status(500).json({ message: 'An error occurred while searching student payments.' });
    }
};


 * Adds an additional fee to a student.
 * GET /api/payments/student/:studentId/add_fee - Fetch available additional fees
 * POST /api/payments/student/:studentId/add_fee - Associate additional fee with student
 
const addAdditionalFee = async (req, res) => {
    const { studentId } = req.params;
    const schoolId = req.user.schoolId; // Assuming req.user is populated by authentication middleware

    try {
        // Fetch student data
        const student = await prisma.student.findUnique({
            where: { student_id: studentId },
            include: { additional_fees: true } // Get associated additional fees
        });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Handle GET request: Return available additional fees
        if (req.method === 'GET') {
            const availableFees = await prisma.additionalFee.findMany({
                where: { schoolId },
                select: { id: true, fee_name: true }
            });
            return res.json({ student, availableFees, associatedFees: student.additional_fees });
        }

        // Handle POST request: Associate additional fee with the student
        const { additional_fee_id } = req.body;

        // Check if the additional fee is already associated with the student
        const existingAssociation = await prisma.student.findFirst({
            where: {
                student_id: studentId,
                additional_fees: { some: { id: parseInt(additional_fee_id) } }
            }
        });

        if (existingAssociation) {
            return res.status(400).json({ message: 'This additional fee is already associated with the student.' });
        }

        // Add the fee association
        await prisma.student.update({
            where: { student_id: studentId },
            data: {
                additional_fees: { connect: { id: parseInt(additional_fee_id) } }
            }
        });

        // Fetch updated associated fees
        const updatedStudent = await prisma.student.findUnique({
            where: { student_id: studentId },
            include: { additional_fees: true }
        });

        return res.json({
            message: 'Additional fee added successfully',
            associatedFees: updatedStudent.additional_fees
        });

    } catch (error) {
        console.error('Error adding additional fee:', error);
        res.status(500).json({ message: 'An error occurred while adding the additional fee.' });
    }
};*/

module.exports = { newPayment, getStudentsWithFilters, printReceipt, studentPayments, getAllPayments, exportPayments, feeReports, getStudentFeeStatement };