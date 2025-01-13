// Seed student payments for a school
//  - Generates random payments for students in the school
//  - Randomly assigns payment methods and amounts
//  - Randomly assigns payment dates within the current term
//  - Updates student balance after each payment
//  - Requires a valid school ID as an argument
//  - Run this script with the command `node seedPayments.js <schoolId>`
//  - Example: `node seedPayments.js 1`
require('dotenv').config();
const prisma = require('../utils/prismaClient');
const { randomUUID } = require('crypto');

const generatePaymentMethod = () => {
  const methods = ['Cash', 'Mpesa', 'Bank', 'Cheque'];
  const weights = [0.4, 0.3, 0.2, 0.1];
  
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
    const currentTerm = await prisma.term.findFirst({
      where: { 
        current: true, 
        schoolId,
        endDate: { gte: new Date() } 
      }
    });

    if (!currentTerm) {
      throw new Error('No active term found for the school');
    }

    const students = await prisma.student.findMany({
      where: { 
        schoolId,
        active: true 
      },
      select: { 
        id: true, 
        cfBalance: true 
      }
    });

    const paymentStats = {
      totalStudents: students.length,
      paymentsCreated: 0,
      totalAmount: 0
    };

    for (const student of students) {
      const paymentCount = Math.floor(Math.random() * 3) + 1;
      
      for (let i = 0; i < paymentCount; i++) {
        const method = generatePaymentMethod();
        const amount = Math.floor(Math.random() * 5000) + 1000;
        const paymentData = {
          method,
          amount,
          payDate: new Date(),
          schoolId,
          studentId: student.id,
          termId: currentTerm.id,
          balance: student.cfBalance - amount
        };

        // For Mpesa or Bank payments, create MpesaTransaction first
        if (method === 'Mpesa' || method === 'Bank') {
          const code = generateTransactionCode();
          
          // Create MpesaTransaction first
          await prisma.mpesaTransaction.create({
            data: {
              code,
              amount,
              verified: false
            }
          });
          
          // Add the code to payment data after MpesaTransaction is created
          paymentData.code = code;
        }

        // Create payment record
        await prisma.feePayment.create({
          data: paymentData
        });

        paymentStats.paymentsCreated++;
        paymentStats.totalAmount += amount;
      }
    }

    console.log('Student payment seeding completed:', paymentStats);
    return paymentStats;
  } catch (error) {
    console.error('Error populating student payments:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
};

if (require.main === module) {
  const schoolId = parseInt(process.argv[2]);
  if (isNaN(schoolId)) {
    console.error('Please provide a valid school ID');
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