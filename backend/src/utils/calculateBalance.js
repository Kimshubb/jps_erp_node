const prisma = require('./prismaClient');

const fetchBalanceData = async (studentId, termId) => {
    try {
        // Fetch student with all necessary relations
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                grade: true,
                additionalFees: {
                    where: {
                        schoolId: student.schoolId,
                    },
                },
            },
        });

        if (!student) {
            throw new Error(`Student not found with ID: ${studentId}`);
        }

        // Fetch fee structure with correct unique constraints
        const feeStructure = await prisma.feeStructure.findUnique({
            where: {
                unique_school_grade_term: {
                    schoolId: student.schoolId,
                    gradeId: student.gradeId,
                    termId: termId
                }
            },
        });

        if (!feeStructure) {
            console.warn(`No fee structure found for school ${student.schoolId}, grade ${student.gradeId}, term ${termId}`);
            return {
                cfBalance: student.cfBalance || 0,
                standardFees: 0,
                additionalFees: 0,
                paidAmount: 0,
            };
        }

        // Calculate standard fees
        const standardFees = 
            (feeStructure.tuitionFee || 0) +
            (feeStructure.assBooks || 0) +
            (feeStructure.diaryFee || 0) +
            (feeStructure.activityFee || 0) +
            (feeStructure.others || 0);

        // Calculate additional fees directly from the included relation
        const additionalFeesTotal = student.additionalFees.reduce(
            (total, fee) => total + (fee.amount || 0),
            0
        );

        // Fetch payments for the term
        const termPayments = await prisma.feePayment.aggregate({
            where: {
                studentId: student.id,
                termId: termId,
                schoolId: student.schoolId,
            },
            _sum: {
                amount: true,
            },
        });

        return {
            cfBalance: student.cfBalance || 0,
            standardFees,
            additionalFees: additionalFeesTotal,
            paidAmount: termPayments._sum?.amount || 0,
        };
    } catch (error) {
        console.error('Error in fetchBalanceData:', error);
        throw error;
    }
};

/**
 * Calculate the student's balance
 */
const calculateBalance = ({ cfBalance, standardFees, additionalFees, paidAmount }) => {
    const totalFees = standardFees + additionalFees;
    return cfBalance + (totalFees - paidAmount);
};

/**
 * Helper function to ensure fee structure exists
 */
const ensureFeeStructure = async (schoolId, gradeId, termId) => {
    const existing = await prisma.feeStructure.findUnique({
        where: {
            unique_school_grade_term: {
                schoolId,
                gradeId,
                termId
            }
        }
    });

    if (!existing) {
        console.warn(`Missing fee structure for school ${schoolId}, grade ${gradeId}, term ${termId}`);
        return false;
    }
    return true;
};

module.exports = {
    fetchBalanceData,
    calculateBalance,
    ensureFeeStructure,
};