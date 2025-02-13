//backend/src/utils/schoolDataService.js
const prisma = require('./prismaClient');

class SchoolDataService {
    constructor(schoolId) {
        this.schoolId = schoolId;
    }

    /**
     * Get the current term for this school
     * @returns {Promise<object>} Current term object
     */
    async getCurrentTerm() {
        try {
            const currentTerm = await prisma.term.findFirst({
                where: {
                    schoolId: this.schoolId,
                    current: true
                },
                select: {
                    id: true,
                    name: true,
                    startDate: true,
                    endDate: true
                }
            });

            if (!currentTerm) {
                throw new Error('No active term found for this school');
            }

            return currentTerm;
        } catch (error) {
            console.log('Error fetching current term:', error);
            console.error('Error fetching current term:', error);
            throw new Error('Failed to fetch current term');
        }
    }
     /**
     * Get student details with grade and stream information
     * @param {string} studentId 
     * @returns {Promise<object>} Student details
     * @throws {Error} When student is not found or database error occurs
     */
     async getStudentDetails(studentId) {
        try {
            console.log('Fetching student details:', studentId);
            const student = await prisma.student.findFirst({ //  Changed from findUnique to findFirst
                where: { id: studentId, schoolId: this.schoolId },
                select: {
                    id: true,
                    fullName: true,
                    grade: { select: { id: true, name: true } },
                    stream: { select: { name: true } },
                    cfBalance: true,
                    active: true,
                    additionalFees: { select: { id: true, feeName: true, amount: true } }
                }
            });
    
            if (!student) {
                throw new Error('Student not found');
            }
    
            return student;
        } catch (error) {
            console.log('Error fetching student details:', error);
            throw new Error(`Failed to fetch student details: ${error.message}`);
        }
    }
    /**
     * Get fee structure for a specific grade and term
     * @param {number} gradeId 
     * @param {number} termId 
     * @returns {Promise<object>} Fee structure details
     * @throws {Error} When fee structure is not found or database error occurs
     */
    async getGradeFeeStructure(gradeId, termId) {
        try {
            console.log('Getting fee structure for grade:', gradeId);
            const feeStructure = await prisma.feeStructure.findFirst({
                where: {
                    gradeId,
                    termId,
                    schoolId: this.schoolId
                },
                select: {
                    tuitionFee: true,
                    assBooks: true,
                    diaryFee: true,
                    activityFee: true,
                    others: true
                }
            });

            if (!feeStructure) {
                throw new Error('Fee structure not found for this grade');
            }

            return feeStructure;
        } catch (error) {
            console.log('Error fetching fee structure:', error);
            if (error.message === 'Fee structure not found for this grade') {
                throw error;
            }
            throw new Error(`Failed to fetch fee structure: ${error.message}`);
        }
    }

    /**
     * Get term payments for a student
     * @param {string} studentId 
     * @param {number} termId 
     * @returns {Promise<Array>} List of payments
     * @throws {Error} When database error occurs
     */
    async getStudentTermPayments(studentId, termId) {
        try {
            console.log('Fetching student term payments:', studentId, termId);
            const payments = await prisma.feePayment.findMany({
                where: {
                    studentId,
                    schoolId: this.schoolId,
                    termId
                },
                orderBy: {
                    payDate: 'asc'
                },
                select: {
                    id: true,
                    method: true,
                    amount: true,
                    payDate: true,
                    code: true,
                    balance: true
                }
            });

            return payments;
        } catch (error) {
            console.log('Error fetching student term payments:', error);
            throw new Error(`Failed to fetch student term payments: ${error.message}`);
        }
    }
    /**
     * Calculate total fees from fee structure
     * @param {object} feeStructure 
     * @returns {number} Total fees
     */
    calculateTotalRegularFees(feeStructure) {
        return (
            feeStructure.tuitionFee +
            feeStructure.assBooks +
            feeStructure.diaryFee +
            feeStructure.activityFee +
            feeStructure.others
        );
    }

    /**
     * Generate complete fee statement for a student
     * @param {string} studentId 
     * @returns {Promise<object>} Complete fee statement
     
    async generateFeeStatement(studentId) {
        console.log(`Generating fee statement for student ${studentId}`);
        try {
            const currentTerm = await this.getCurrentTerm();
            console.log('Current term:', currentTerm);
            const student = await this.getStudentDetails(studentId);
            console.log('Student details:', student);
            const feeStructure = await this.getGradeFeeStructure(student.grade.id, currentTerm.id);
            console.log('Fee structure:', feeStructure);
            const payments = await this.getStudentTermPayments(studentId, currentTerm.id);
            console.log('Payments:', payments);
            

            // Calculate totals
            const regularFees = this.calculateTotalRegularFees(feeStructure);
            console.log('Regular fees:', regularFees);
            const totalAdditionalFees = student.additionalFees.reduce((sum, fee) => sum + fee.amount, 0);
            console.log('Additional fees:', totalAdditionalFees);
            const totalBilled = regularFees + totalAdditionalFees;
            const totalPaid = payments.reduce((sum, payment) => sum + payment.amount, 0);
            console.log('Total billed:', totalBilled);
            const currentBalance = (student.cfBalance + totalBilled) - totalPaid;
            console.log('Current balance:', currentBalance);
            console.log('Fee statement generated successfully');
            return {
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
                        total: regularFees,
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
                    totalBilled,
                    carriedForwardBalance: student.cfBalance
                },
                payments: payments.map(payment => ({
                    date: payment.payDate,
                    method: payment.method,
                    amount: payment.amount,
                    code: payment.code,
                    runningBalance: payment.balance
                })),
                summary: {
                    totalRegularFees: regularFees,
                    totalAdditionalFees,
                    totalBilled,
                    totalPaid,
                    carriedForwardBalance: student.cfBalance,
                    currentBalance
                }
            };
        } catch (error) {
            console.log('Error generating fee statement:', error);
            console.error('Error generating fee statement:', error);
            throw error;
        }
    }*/
    /**
     * Get recent payments for this school
     * @param {number} limit 
     * @param {number} schoolId
     * @returns {Promise<object[]>} List of recent payments
     */
    async getPayments({ limit, offset, includeVerification = false }) {
        try {
            const currentTerm = await this.getCurrentTerm();
            
            // Base select object with improved relations
            const baseSelect = {
                id: true,
                method: true,
                amount: true,
                payDate: true,
                code: true, // Always include code since it's needed for MPesa relation
                student: {
                    select: {
                        fullName: true,
                        grade: {
                            select: { name: true },
                        },
                    },
                },
            };
    
            // If verification is needed, include MPesa transaction details
            if (includeVerification) {
                baseSelect.mpesaTransaction = {
                    select: {
                        verified: true,
                        amount: true,
                    }
                };
            }
    
            // Query options with proper relations
            const queryOptions = {
                where: { 
                    schoolId: this.schoolId,
                    termId: currentTerm.id,
                },
                orderBy: { payDate: 'desc' },
                select: baseSelect,
            };
    
            // Add pagination if limit is provided
            if (typeof limit === 'number') {
                queryOptions.take = limit;
                queryOptions.skip = offset || 0;
            }
    
            // Execute query
            const payments = await prisma.feePayment.findMany(queryOptions);
    
            // Transform the results to match the expected format
            return payments.map(payment => ({
                ...payment,
                isVerified: payment.mpesaTransaction?.verified ?? null,
                // Remove mpesaTransaction from response if it wasn't requested
                ...(includeVerification ? {} : { mpesaTransaction: undefined })
            }));
    
        } catch (error) {
            console.error('Error fetching payments:', error);
            throw error;
        }
    }
    
    // Method for paginated list view
    async getRecentPayments(limit = 10, offset = 0) {
        return this.getPayments({ 
            limit, 
            offset, 
            includeVerification: true 
        });
    }
    
    // Method for export (gets all payments)
    async getAllPaymentsForExport() {
        return this.getPayments({ 
            includeVerification: true 
        });
    }

    /**
     * Get the count of active students in a specific term
     * @param {number} termId 
     * @returns {Promise<number>} Active student count
     */
    async getActiveStudents(termId) {
        return prisma.student.count({
            where: { schoolId: this.schoolId, currentTermId: termId, active: true }
        });
    }

    /**
     * Get the count of inactive students in a specific term
     * @param {number} termId 
     * @returns {Promise<number>} Inactive student count
     */
    async getInactiveStudentsTerm(termId) {
        return prisma.student.count({
            where: { schoolId: this.schoolId, currentTermId: termId, active: false }
        });
    }

    /**
     * Get the count of inactive students for a specific year
     * @param {number} year 
     * @returns {Promise<number>} Inactive student count
     */
    async getInactiveStudentsYear(year) {
        return prisma.student.count({
            where: {
                schoolId: this.schoolId,
                active: false,
                currentTerm: { year: year }
            }
        });
    }

    /**
     * Sum payments via a specific method for a given term
     * @param {number} termId 
     * @param {string} method 
     * @returns {Promise<number>} Total payment amount
     */
    async getPaidViaMethodTerm(termId, method) {
        const result = await prisma.feePayment.aggregate({
            where: { schoolId: this.schoolId, termId, method },
            _sum: { amount: true }
        });
        return result._sum.amount || 0;
    }

    /**
     * Sum payments via a specific method for a given year
     * @param {number} year 
     * @param {string} method 
     * @returns {Promise<number>} Total payment amount
     */
    async getPaidViaMethodYear(year, method) {
        const result = await prisma.feePayment.aggregate({
            where: {
                schoolId: this.schoolId,
                method,
                term: { year }
            },
            _sum: { amount: true }
        });
        return result._sum.amount || 0;
    }

    /**
     * Sum payments via a specific method for today
     * @param {string} method 
     * @returns {Promise<number>} Total payment amount
     */
    async getPaidViaMethodToday(method) {
        // Create date range for today (midnight to midnight)
        const today = new Date();
        const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

        const result = await prisma.feePayment.aggregate({
            where: { 
                schoolId: this.schoolId, 
                method,
                payDate: {
                    gte: startOfDay,
                    lt: endOfDay
                }
            },
            _sum: { 
                amount: true 
            }
        });
        
        return result._sum.amount || 0;
    }
     /**
     * Get the school details
     * @returns {Promise<object>} School object
     */
    async getSchoolDetails() {
        return prisma.school.findUnique({
            where: { id: this.schoolId }
        });
    }
    /**
     * Get the school details by userId
     * @param {number} userId 
     * @returns {Promise<object>} School object
     */
    async getSchoolByUserId(userId) {
        return prisma.school.findFirst({
            where: { users: { some: { id: userId } } }
        });
    }

    /**
     * Fetch all grades for the school with their associated streams
     * @returns {Promise<{grades: Array, streams: Array}>}
     */
    async getGradesAndStreams() {
        try {
            const grades = await prisma.grade.findMany({
                where: { schoolId: this.schoolId },
                include: { streams: true },
                orderBy: { name: 'asc' }
            });
            
            return {
                grades,
                streams: grades.flatMap(grade => grade.streams)
            };
        } catch (error) {
            console.error('Error fetching grades and streams:', error);
            throw new Error('Failed to fetch school data');
        }
    }

    /**
     * Get streams for a specific grade
     * @param {number} gradeId 
     * @returns {Promise<Array>}
     */
    async getStreamsByGrade(gradeId) {
        try {
            const streams = await prisma.stream.findMany({
                where: {
                    gradeId: parseInt(gradeId),
                    grade: {
                        schoolId: this.schoolId
                    }
                },
                select: {
                    id: true,
                    name: true
                },
                orderBy: {
                    name: 'asc'
                }
            });

            return streams;
        } catch (error) {
            console.error(`Error fetching streams for grade ${gradeId}:`, error);
            throw new Error('Failed to fetch streams');
        }
    }

    /**
     * Validate if a stream belongs to a grade in this school
     * @param {number} gradeId 
     * @param {number} streamId 
     * @returns {Promise<boolean>}
     */
    async validateGradeAndStream(gradeId, streamId) {
        try {
            const stream = await prisma.stream.findFirst({
                where: {
                    id: parseInt(streamId),
                    gradeId: parseInt(gradeId),
                    grade: {
                        schoolId: this.schoolId
                    }
                }
            });

            return !!stream;
        } catch (error) {
            console.error('Error validating grade and stream:', error);
            throw new Error('Failed to validate grade and stream');
        }
    }
     /**
     * Get all form options needed for student registration
     * @returns {Promise<Object>}
     */
     async getStudentRegistrationOptions() {
        try {
            // Get grades and streams
            const { grades, streams } = await this.getGradesAndStreams();

            // Get current term
            const currentTerm = await this.getCurrentTerm();

            return {
                grades,
                streams,
                currentTerm
            };
        } catch (error) {
            console.error('Error fetching registration options:', error);
            throw new Error('Failed to fetch registration options');
        }
    }
    /**
     * Get fee report data for all grades in the current term
     * @returns {Promise<Object>} Complete fee report data
     */
    async getFeeReportData() {
        try {
            const currentTerm = await this.getCurrentTerm();
            const previousTerm = await this.getPreviousTerm(currentTerm.startDate);

            const [
                gradeDetails,
                paymentMethodComparison,
                termComparison,
                additionalFeesComparison
            ] = await Promise.all([
                this.getGradeDetailsWithFees(currentTerm.id),
                this.getPaymentMethodComparison(currentTerm.id, previousTerm?.id),
                this.getTermComparison(currentTerm.id, previousTerm?.id),
                this.getAdditionalFeesComparison()
            ]);

            return {
                gradeDetails,
                paymentMethodComparison,
                termComparison,
                additionalFeesComparison
            };
        } catch (error) {
            console.error('Error generating fee report data:', error);
            throw new Error('Failed to generate fee report data');
        }
    }

    /**
     * Get detailed fee information for all grades
     * @param {number} termId 
     * @returns {Promise<Array>} Grade details with fees
     */
    async getGradeDetailsWithFees(termId) {
        const grades = await prisma.grade.findMany({
            where: { schoolId: this.schoolId },
            include: {
                feeStructure: {
                    where: { termId }
                }
            }
        });

        return Promise.all(grades.map(async (grade) => {
            const [feeStructure, additionalFees, payments] = await Promise.all([
                grade.feeStructure[0], // From the included relation
                this.getGradeAdditionalFees(grade.id),
                this.getGradePayments(grade.id, termId)
            ]);

            const basicFees = feeStructure ? {
                tuitionFee: feeStructure.tuitionFee,
                assBooks: feeStructure.assBooks,
                diaryFee: feeStructure.diaryFee,
                activityFee: feeStructure.activityFee,
                others: feeStructure.others,
                total: feeStructure.tuitionFee + 
                       feeStructure.assBooks + 
                       feeStructure.diaryFee + 
                       feeStructure.activityFee + 
                       feeStructure.others
            } : { total: 0 };

            return {
                gradeId: grade.id,
                gradeName: grade.name,
                basicFees,
                additionalFees,
                payments: {
                    total: payments.reduce((sum, payment) => sum + payment.amount, 0),
                    items: payments
                }
            };
        }));
    }

    /**
     * Get additional fees for a grade's students
     * @param {number} gradeId 
     * @returns {Promise<Object>} Additional fees breakdown
     */
    async getGradeAdditionalFees(gradeId) {
        // Get students in the grade
        const students = await prisma.student.findMany({
            where: { gradeId },
            include: {
                additionalFees: true
            }
        });

        // Aggregate all additional fees
        const feesMap = new Map();
        students.forEach(student => {
            student.additionalFees.forEach(fee => {
                if (!feesMap.has(fee.feeName)) {
                    feesMap.set(fee.feeName, {
                        name: fee.feeName,
                        amount: fee.amount,
                        count: 1
                    });
                } else {
                    const existing = feesMap.get(fee.feeName);
                    existing.count += 1;
                }
            });
        });

        return {
            items: Array.from(feesMap.values()),
            total: Array.from(feesMap.values())
                .reduce((sum, fee) => sum + (fee.amount * fee.count), 0)
        };
    }

    /**
     * Get payments for a specific grade in a term
     * @param {number} gradeId 
     * @param {number} termId 
     * @returns {Promise<Array>} Payments
     */
    async getGradePayments(gradeId, termId) {
        return prisma.feePayment.findMany({
            where: {
                termId,
                student: {
                    gradeId
                },
                schoolId: this.schoolId
            },
            include: {
                mpesaTransaction: {
                    select: {
                        verified: true
                    }
                }
            }
        });
    }

    /**
     * Compare payment methods between terms
     * @param {number} currentTermId 
     * @param {number|null} previousTermId 
     * @returns {Promise<Object>} Payment method comparison
     */
    async getPaymentMethodComparison(currentTermId, previousTermId) {
        const methods = ['MPESA', 'CASH', 'BANK'];
        const comparison = {};

        for (const method of methods) {
            const [current, previous] = await Promise.all([
                prisma.feePayment.aggregate({
                    where: {
                        schoolId: this.schoolId,
                        termId: currentTermId,
                        method
                    },
                    _sum: { amount: true }
                }),
                previousTermId ? prisma.feePayment.aggregate({
                    where: {
                        schoolId: this.schoolId,
                        termId: previousTermId,
                        method
                    },
                    _sum: { amount: true }
                }) : Promise.resolve({ _sum: { amount: 0 } })
            ]);

            comparison[method] = {
                current: current._sum.amount || 0,
                previous: previous._sum.amount || 0
            };
        }

        return comparison;
    }

    /**
     * Compare additional fees
     * @returns {Promise<Object>} Additional fees summary
     */
    async getAdditionalFeesComparison() {
        const additionalFees = await prisma.additionalFee.findMany({
            where: {
                schoolId: this.schoolId
            },
            include: {
                _count: {
                    select: { students: true }
                }
            }
        });

        return additionalFees.reduce((summary, fee) => {
            summary[fee.feeName] = {
                amount: fee.amount,
                studentCount: fee._count.students
            };
            return summary;
        }, {});
    }

    /**
     * Get term comparison data
     * @param {number} currentTermId 
     * @param {number|null} previousTermId 
     * @returns {Promise<Object>} Term comparison
     */
    async getTermComparison(currentTermId, previousTermId) {
        const [currentPayments, previousPayments] = await Promise.all([
            prisma.feePayment.aggregate({
                where: {
                    schoolId: this.schoolId,
                    termId: currentTermId
                },
                _sum: { amount: true },
                _avg: { balance: true }
            }),
            previousTermId ? prisma.feePayment.aggregate({
                where: {
                    schoolId: this.schoolId,
                    termId: previousTermId
                },
                _sum: { amount: true },
                _avg: { balance: true }
            }) : Promise.resolve({ _sum: { amount: 0 }, _avg: { balance: 0 } })
        ]);

        return {
            currentTerm: {
                totalPayments: currentPayments._sum.amount || 0,
                averageBalance: currentPayments._avg.balance || 0
            },
            previousTerm: {
                totalPayments: previousPayments._sum.amount || 0,
                averageBalance: previousPayments._avg.balance || 0
            },
            change: previousPayments._sum.amount ? 
                ((currentPayments._sum.amount - previousPayments._sum.amount) / previousPayments._sum.amount) * 100 : 0
        };
    }
}

module.exports = SchoolDataService;
