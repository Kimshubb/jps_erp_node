const prisma = require('../utils/prismaClient');
const { calculateBalance } = require('../utils/calculateBalance');
const { validationResult } = require('express-validator');
const { DateTime } = require('luxon'); // For date handling
const FeesUtility = require('./FeesUtility');
const QRCode = require('qrcode');
const SchoolDataService = require('../utils/schoolDataService');

// POST /api/payments/new_payment
const newPayment = async (req, res) => {
    const { student_id, amount, method, code } = req.body;
    const schoolId = req.user.schoolId;

    // Validate form inputs (optional, as frontend should handle this primarily)
    //const errors = validationResult(req);
    //if (!errors.isEmpty()) {
    //    return res.status(400).json({ errors: errors.array() });
    //}

    try {
        // Check if there is a current term for the school
        const currentTerm = await prisma.term.findFirst({
            where: { current: true, schoolId }
        });
        if (!currentTerm) {
            throw new Error('No current term is set. Please set a current term before making payments.');
        }

        // Find the student by student_id and school_id
        const student = await prisma.student.findUnique({
            where: {
                student_id_schoolId: { student_id, schoolId }
            }
        });
        if (!student) {
            throw new Error('Student not found');
        }

        // Calculate balance and carry forward balance
        const { balance, carryForwardBalance } = await calculateBalance(student.student_id);

        // If payment method is Mpesa, check transaction code
        if (method === 'Mpesa') {
            const existingTransaction = await prisma.mpesaTransaction.findUnique({
                where: { code }
            });
            if (existingTransaction) {
                throw new Error('This Mpesa transaction code has already been used. Please enter a new code.');
            }

            // Create new MpesaTransaction
            await prisma.mpesaTransaction.create({
                data: {
                    code,
                    amount,
                    verified: false
                }
            });
        }

        // Create a new payment record
        const newPayment = await prisma.feePayment.create({
            data: {
                method,
                amount,
                code: method === 'Mpesa' || method === 'Bank' ? code : null,
                balance: balance - amount,
                schoolId,
                studentId: student.student_id,
                pay_date: DateTime.now().toISODate(),
                termId: currentTerm.id
            }
        });

        // Update student's carry forward balance
        await prisma.student.update({
            where: { student_id: student.student_id },
            data: { cf_balance: Math.max(0, balance - amount) }
        });

        // Respond with the payment and a success message
        res.json({ message: 'Payment added successfully', payment: newPayment });

    } catch (error) {
        console.error('Error processing payment:', error);
        res.status(500).json({ message: error.message || 'An unexpected error occurred.' });
    }
};

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

/**
 * Generates a receipt or fee statement for a student.
 * GET /api/payments/student/:studentId/receipt/:paymentId
 */
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

/**
 * Fetches all recent payments for the current school.
 * GET /api/payments/recent_payments
 */
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
};

/**
 * Generates fee reports for the school, including payment and term comparisons.
 * GET /api/payments/fee_reports
 */
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

/**
 * Searches student payments based on query and returns results with payment details.
 * GET /api/payments/search_student_payments?q=searchTerm
 */
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

/**
 * Adds an additional fee to a student.
 * GET /api/payments/student/:studentId/add_fee - Fetch available additional fees
 * POST /api/payments/student/:studentId/add_fee - Associate additional fee with student
 */
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
};

module.exports = { newPayment, studentPayments, printReceipt, viewAllPayments, feeReports, searchStudentPayments, addAdditionalFee };