const prisma = require('./prismaClient');

/**
 * Calculate the student's balance based on provided data.
 */
const calculateBalance = ({ cfBalance, standardFees, additionalFees, paidAmount }) => {
    const totalFees = standardFees + additionalFees;
    return cfBalance + (totalFees - paidAmount);
};

/**
 * Fetch all necessary data for calculating a student's balance.
 */
const fetchBalanceData = async (studentId, termId) => {
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: {
            cfBalance: true,
            gradeId: true
        }
    });

    if (!student) {
        throw new Error('Student not found');
    }

    const feeStructure = await prisma.feeStructure.findFirst({
        where: { gradeId: student.gradeId, termId }
    });

    const standardFees =
        (feeStructure?.tuitionFee || 0) +
        (feeStructure?.assBooks || 0) +
        (feeStructure?.diaryFee || 0) +
        (feeStructure?.activityFee || 0) +
        (feeStructure?.others || 0);

    const additionalFees = await prisma.additionalFee.findMany({
        where: { students: { some: { id: studentId } } }
    });

    const additionalFeesTotal = additionalFees.reduce((sum, fee) => sum + fee.amount, 0);

    const termPayments = await prisma.feePayment.aggregate({
        where: { studentId, termId },
        _sum: { amount: true }
    });

    const paidAmount = termPayments._sum.amount || 0;

    return { cfBalance: student.cfBalance, standardFees, additionalFees: additionalFeesTotal, paidAmount };
};

module.exports = { calculateBalance, fetchBalanceData };
