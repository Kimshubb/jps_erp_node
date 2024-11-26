const prisma = require('./prismaClient');

const calculateBalance = async (studentId, termId) => {
    const student = await prisma.student.findUnique({
        where: { id: studentId },
        select: { cfBalance: true }
    });

    if (!student) {
        throw new Error("Student not found");
    }

    // Fetch standard fees for the current term
    const feeStructure = await prisma.feeStructure.findFirst({
        where: { gradeId: student.gradeId, termId }
    });

    const standardFees = (
        feeStructure?.tuitionFee || 0 +
        feeStructure?.assBooks || 0 +
        feeStructure?.diaryFee || 0 +
        feeStructure?.activityFee || 0 +
        feeStructure?.others || 0
    );

    // Fetch additional fees for the current term
    const additionalFees = await prisma.additionalFee.findMany({
        where: { students: { some: { id: studentId } } }
    });

    const additionalFeesTotal = additionalFees.reduce((sum, fee) => sum + fee.amount, 0);

    // Fetch payments made for the current term
    const termPayments = await prisma.feePayment.aggregate({
        where: { studentId, termId },
        _sum: { amount: true }
    });

    const paidAmount = termPayments._sum.amount || 0;

    // Calculate total balance
    const currentBalance = student.cfBalance + (standardFees + additionalFeesTotal - paidAmount);

    return currentBalance;
};

module.exports = calculateBalance;