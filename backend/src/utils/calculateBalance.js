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
        gradeId: true,
        schoolId: true,
      },
    });
  
    if (!student) {
      throw new Error('Student not found');
    }
  
    const { cfBalance, gradeId, schoolId } = student;
  
    // Fetch Fee Structure for the grade, term, and school
    const feeStructure = await prisma.feeStructure.findFirst({
      where: { schoolId, gradeId, termId },
    });
  
    if (!feeStructure) {
      console.error('No Fee Structure found for:', { schoolId, gradeId, termId });
      return { cfBalance, standardFees: 0, additionalFees: 0, paidAmount: 0 };
    }
  
    console.log('Fee Structure:', feeStructure);
  
    const standardFees =
      (feeStructure.tuitionFee || 0) +
      (feeStructure.assBooks || 0) +
      (feeStructure.diaryFee || 0) +
      (feeStructure.activityFee || 0) +
      (feeStructure.others || 0);
  
    // Fetch Additional Fees
    const additionalFeesTotal = await prisma.additionalFee.aggregate({
      where: {
        schoolId,
        students: { some: { id: studentId } },
      },
      _sum: { amount: true },
    })._sum?.amount || 0;
  
    // Fetch Payments for the term
    const termPayments = await prisma.feePayment.aggregate({
      where: { studentId, termId, schoolId },
      _sum: { amount: true },
    });
  
    const paidAmount = termPayments._sum?.amount || 0;
  
    console.log('Student:', student);
    console.log('Standard Fees:', standardFees);
    console.log('Additional Fees Total:', additionalFeesTotal);
    console.log('Term Payments:', termPayments);
  
    return { cfBalance, standardFees, additionalFees: additionalFeesTotal, paidAmount };
  };
  
  
module.exports = { calculateBalance, fetchBalanceData };
