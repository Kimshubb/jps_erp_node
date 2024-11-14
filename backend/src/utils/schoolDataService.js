const prisma = require('./prismaClient');

class SchoolDataService {
    constructor(schoolId) {
        this.schoolId = schoolId;
    }

    /**
     * Get the current term for this school
     * @returns {Promise<object>} Current term object
     */
    async getCurrentTerm() {
        return prisma.term.findFirst({
            where: { schoolId: this.schoolId, current: true }
        });
    }

    /**
     * Get recent payments for this school
     * @param {number} limit 
     * @returns {Promise<object[]>} List of recent payments
     */
    async getRecentPayments(limit = 10) {
        return prisma.feePayment.findMany({
            where: { schoolId: this.schoolId },
            take: limit,
            orderBy: { payDate: 'desc' }
        });
    }

    /**
     * Get the count of active students in a specific term
     * @param {number} termId 
     * @returns {Promise<number>} Active student count
     */
    async getActiveStudents(termId) {
        return prisma.student.count({
            where: { schoolId: this.schoolId, currentTermId: termId, active: true }
        });
    }

    /**
     * Get the count of inactive students in a specific term
     * @param {number} termId 
     * @returns {Promise<number>} Inactive student count
     */
    async getInactiveStudentsTerm(termId) {
        return prisma.student.count({
            where: { schoolId: this.schoolId, currentTermId: termId, active: false }
        });
    }

    /**
     * Get the count of inactive students for a specific year
     * @param {number} year 
     * @returns {Promise<number>} Inactive student count
     */
    async getInactiveStudentsYear(year) {
        return prisma.student.count({
            where: {
                schoolId: this.schoolId,
                active: false,
                currentTerm: { year: year }
            }
        });
    }

    /**
     * Sum payments via a specific method for a given term
     * @param {number} termId 
     * @param {string} method 
     * @returns {Promise<number>} Total payment amount
     */
    async getPaidViaMethodTerm(termId, method) {
        const result = await prisma.feePayment.aggregate({
            where: { schoolId: this.schoolId, termId, method },
            _sum: { amount: true }
        });
        return result._sum.amount || 0;
    }

    /**
     * Sum payments via a specific method for a given year
     * @param {number} year 
     * @param {string} method 
     * @returns {Promise<number>} Total payment amount
     */
    async getPaidViaMethodYear(year, method) {
        const result = await prisma.feePayment.aggregate({
            where: {
                schoolId: this.schoolId,
                method,
                term: { year }
            },
            _sum: { amount: true }
        });
        return result._sum.amount || 0;
    }

    /**
     * Sum payments via a specific method for today
     * @param {string} method 
     * @returns {Promise<number>} Total payment amount
     */
    async getPaidViaMethodToday(method) {
        const today = new Date();
        const result = await prisma.feePayment.aggregate({
            where: { schoolId: this.schoolId, method, payDate: today },
            _sum: { amount: true }
        });
        return result._sum.amount || 0;
    }
     /**
     * Get the school details
     * @returns {Promise<object>} School object
     */
    async getSchoolDetails() {
        return prisma.school.findUnique({
            where: { id: this.schoolId }
        });
    }
    /**
     * Get the school details by userId
     * @param {number} userId 
     * @returns {Promise<object>} School object
     */
    async getSchoolByUserId(userId) {
        return prisma.school.findFirst({
            where: { users: { some: { id: userId } } }
        });
    }


}

module.exports = SchoolDataService;
