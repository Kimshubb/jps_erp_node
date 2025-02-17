const SchoolDataService = require('./schoolDataService');

/**
 * Calculate the student's current balance
 * @param {number} schoolId 
 * @param {string} studentId 
 * @param {number} termId 
 * @returns {Promise<object>} Balance details
 * @throws {Error} If any data is missing or an error occurs
 */
const calculateStudentBalance = async (schoolId, studentId, termId) => {
    try {
        console.log(`📊 Calculating balance for Student: ${studentId}, School: ${schoolId}, Term: ${termId}`);

        // Initialize the data service
        const schoolDataService = new SchoolDataService(schoolId);

        // Fetch student details
        const student = await schoolDataService.getStudentDetails(studentId);
        console.log('👩‍🎓 Student Data:', student);

        if (!student.grade || !student.grade.id) {
            throw new Error('Student is not assigned to a grade.');
        }

        // Fetch fee structure
        const feeStructure = await schoolDataService.getGradeFeeStructure(student.grade.id, termId);
        console.log('💰 Fee Structure:', feeStructure);

        // Fetch payments
        const payments = await schoolDataService.getStudentTermPayments(studentId, termId);
        console.log('💳 Payments:', payments);

        // Calculate fees
        const standardFees = (feeStructure.tuitionFee || 0) +
                             (feeStructure.assBooks || 0) +
                             (feeStructure.diaryFee || 0) +
                             (feeStructure.activityFee || 0) +
                             (feeStructure.others || 0);

        const additionalFees = student.additionalFees.reduce((sum, fee) => sum + (fee.amount || 0), 0);
        const totalBilled = standardFees + additionalFees;

        // Calculate total paid
        const totalPaid = payments.reduce((sum, payment) => sum + (payment.amount || 0), 0);

        // Calculate current balance
        const currentBalance = (student.cfBalance + totalBilled) - totalPaid;

        const balanceData = {
            cfBalance: student.cfBalance || 0,
            standardFees,
            additionalFees,
            totalBilled,
            totalPaid,
            currentBalance
        };

        console.log(`✅ Balance Calculated:`, balanceData);
        return balanceData;

    } catch (error) {
        console.error('❌ Error calculating student balance:', error.message);
        throw new Error(`Failed to calculate student balance: ${error.message}`);
    }
};

module.exports = calculateStudentBalance;
