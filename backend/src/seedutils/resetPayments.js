require('dotenv').config();
const prisma = require('../utils/prismaClient');

const resetFeePayments = async () => {
  try {
    // Fetch all students
    const students = await prisma.student.findMany({
      select: { 
        id: true 
      }
    });

    const stats = {
      totalStudents: students.length,
      paymentsDeleted: 0,
      balancesReset: 0
    };

    // Reset balances for all students
    for (const student of students) {
      // Set student balance to zero
      await prisma.student.update({
        where: { id: student.id },
        data: { cfBalance: 0 }
      });
      stats.balancesReset++;
    }

    // Delete all fee payments
    stats.paymentsDeleted = await prisma.feePayment.deleteMany({});

    console.log('Fee payments reset completed:', stats);
    return stats;
  } catch (error) {
    console.error('Error resetting fee payments:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

// Run the reset function if this file is run directly
if (require.main === module) {
  resetFeePayments()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { resetFeePayments };
