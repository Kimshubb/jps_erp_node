// src/utils/calculateBalance.js
const prisma = require('../utils/prismaClient');

/**
 * Calculates the balance for a student.
 * @param {string} studentId - The ID of the student.
 * @returns {Promise<{balance: number, carryForwardBalance: number}>}
 */
const calculateBalance = async (studentId) => {
    // Fetch the student record
    const student = await prisma.student.findUnique({
        where: { student_id: studentId },
        include: { grade: true }
    });
    if (!student) {
        throw new Error("Student not found");
    }

    // Get the current term for the student's school
    const currentTerm = await prisma.term.findFirst({
        where: { current: true, schoolId: student.school_id }
    });
    if (!currentTerm) {
        throw new Error("Current term not found");
    }

    // Fetch the fee structure for the student's grade and current term
    const feeStructure = await prisma.feeStructure.findFirst({
        where: {
            gradeId: student.grade.id,
            schoolId: student.school_id,
            termId: currentTerm.id
        }
    });
    if (!feeStructure) {
        throw new Error("Fee structure not found for the student's grade and school in the current term");
    }

    // Calculate total standard fees
    const totalStandardFees = (
        feeStructure.tuition_fee +
        feeStructure.ass_books +
        feeStructure.diary_fee +
        feeStructure.activity_fee +
        feeStructure.others
    );

    // Calculate total additional fees for the student
    const totalAdditionalFees = await prisma.additionalFee.findMany({
        where: {
            students: {
                some: { student_id: studentId }
            }
        },
        select: { amount: true }
    }).then(fees => fees.reduce((acc, fee) => acc + fee.amount, 0));

    // Retrieve the last term payment for carry forward balance
    const previousTermPayment = await prisma.feePayment.findFirst({
        where: {
            studentId: studentId,
            termId: { not: currentTerm.id }
        },
        orderBy: { termId: 'desc' }
    });

    // Start with the carry forward balance from onboarding
    let carryForwardBalance = student.cf_balance;

    // Add outstanding balance from the previous term if it exists
    if (previousTermPayment) {
        carryForwardBalance += previousTermPayment.balance || 0.0;
    }

    // Calculate total amount paid by the student in the current term
    const totalPaid = await prisma.feePayment.aggregate({
        where: { studentId: studentId, termId: currentTerm.id },
        _sum: { amount: true }
    }).then(result => result._sum.amount || 0);

    // Calculate the balance owed
    const balance = (totalStandardFees + totalAdditionalFees + carryForwardBalance) - totalPaid;

    return { balance, carryForwardBalance };
};

module.exports = { calculateBalance };
