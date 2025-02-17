require('dotenv').config();
const prisma = require('../utils/prismaClient');
const calculateStudentBalance = require('../utils/CalculateFeeBalance'); // Import the updated function
const { randomUUID } = require('crypto');

const generatePaymentMethod = () => {
  const methods = ['Cash', 'Mpesa', 'Bank'];
  const weights = [0.4, 0.3, 0.2];

  const randomValue = Math.random();
  let cumulativeWeight = 0;

  for (let i = 0; i < methods.length; i++) {
    cumulativeWeight += weights[i];
    if (randomValue <= cumulativeWeight) {
      return methods[i];
    }
  }

  return 'Cash';
};

const generateTransactionCode = () => {
  return `TRX-${randomUUID().slice(0, 8).toUpperCase()}`;
};

const populateStudentPayments = async (schoolId) => {
  try {
    // Fetch the current term for the school
    const currentTerm = await prisma.term.findFirst({
      where: {
        current: true,
        schoolId,
        endDate: { gte: new Date() },
      },
    });

    if (!currentTerm) {
      throw new Error('No active term found for the school');
    }

    // Fetch all active students for the school
    const students = await prisma.student.findMany({
      where: {
        schoolId,
        active: true,
      },
      select: {
        id: true,
      },
    });

    const paymentStats = {
      totalStudents: students.length,
      paymentsCreated: 0,
      totalAmount: 0,
    };

    for (const student of students) {
      // Get the current balance using the updated function
      const balanceData = await calculateStudentBalance(schoolId, student.id, currentTerm.id);
      console.log(`📊 Balance for student ${student.id}:`, balanceData);

      let updatedBalance = balanceData.currentBalance;

      // Randomly generate payments for the student
      const paymentCount = Math.floor(Math.random() * 3) + 1;

      for (let i = 0; i < paymentCount; i++) {
        const method = generatePaymentMethod();
        const amount = Math.floor(Math.random() * 5000) + 1000;

        // Deduct payment amount from balance
        updatedBalance -= amount;

        // Prevent negative balances
        if (updatedBalance < 0) {
          updatedBalance = 0;
        }

        const paymentData = {
          method,
          amount,
          payDate: new Date(),
          schoolId,
          studentId: student.id,
          termId: currentTerm.id,
          balance: updatedBalance,
        };

        // For Mpesa or Bank payments, create a transaction
        if (method === 'Mpesa' || method === 'Bank') {
          const code = generateTransactionCode();

          // Create MpesaTransaction first
          await prisma.mpesaTransaction.create({
            data: {
              code,
              amount,
              verified: false,
            },
          });

          // Add the transaction code to the payment data
          paymentData.code = code;
        }

        // Create the payment record
        await prisma.feePayment.create({
          data: paymentData,
        });

        paymentStats.paymentsCreated++;
        paymentStats.totalAmount += amount;
      }
    }

    console.log('✅ Student payment seeding completed:', paymentStats);
    return paymentStats;
  } catch (error) {
    console.error('❌ Error populating student payments:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

// Run script if executed directly
if (require.main === module) {
  const schoolId = parseInt(process.argv[2]);
  if (isNaN(schoolId)) {
    console.error('❌ Please provide a valid school ID');
    process.exit(1);
  }

  populateStudentPayments(schoolId)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { populateStudentPayments };
