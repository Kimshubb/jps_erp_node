require('dotenv').config();
const prisma = require('../utils/prismaClient');

const resetStudentPayments = async (schoolId) => {
  try {
    // Check if the school exists
    const school = await prisma.school.findUnique({
      where: { id: schoolId },
    });

    if (!school) {
      throw new Error(`School with ID ${schoolId} not found`);
    }

    console.log(`Resetting fee payments for all students in school ID: ${schoolId}`);

    // Fetch all students in the school
    const students = await prisma.student.findMany({
      where: { schoolId },
      select: { id: true },
    });

    if (students.length === 0) {
      console.log('No students found in the specified school.');
      return;
    }

    // Reset payments for each student
    const resetTasks = students.map((student) =>
      prisma.student.update({
        where: { id: student.id },
        data: {
          cfBalance: 0, // Reset the balance to zero
        },
      })
    );

    // Await all the updates
    await Promise.all(resetTasks);

    // Optionally delete all fee payment records for the students
    await prisma.feePayment.deleteMany({
      where: { studentId: { in: students.map((s) => s.id) } },
    });

    console.log(`Fee payments successfully reset for ${students.length} students in school ID: ${schoolId}.`);
  } catch (error) {
    console.error('Error resetting fee payments:', error);
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

  resetStudentPayments(schoolId)
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { resetStudentPayments };
