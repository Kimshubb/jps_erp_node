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
        try {
            const currentTerm = await prisma.term.findFirst({
                where: {
                    schoolId: this.schoolId,
                    current: true
                },
                select: {
                    id: true,
                    name: true,
                    startDate: true,
                    endDate: true
                }
            });

            if (!currentTerm) {
                throw new Error('No active term found for this school');
            }

            return currentTerm;
        } catch (error) {
            console.error('Error fetching current term:', error);
            throw new Error('Failed to fetch current term');
        }
    }


    /**
     * Get recent payments for this school
     * @param {number} limit 
     * @param {number} schoolId
     * @returns {Promise<object[]>} List of recent payments
     */
    async getRecentPayments(limit = 10) {
        try {
            return await prisma.feePayment.findMany({
                where: { schoolId: this.schoolId }, // Query for specific school ID
                orderBy: { payDate: 'desc' },
                take: limit,
                select: {
                    id: true,
                    method: true,
                    amount: true,
                    payDate: true,
                    student: {
                        select: {
                            fullName: true,
                            grade: {
                                select: { name: true },
                            },
                        },
                    },
                },
            });
        } catch (error) {
            console.error('Error fetching recent payments:', error);
            throw new Error('Unable to fetch recent payments');
        }
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

    /**
     * Fetch all grades for the school with their associated streams
     * @returns {Promise<{grades: Array, streams: Array}>}
     */
    async getGradesAndStreams() {
        try {
            const grades = await prisma.grade.findMany({
                where: { schoolId: this.schoolId },
                include: { streams: true },
                orderBy: { name: 'asc' }
            });
            
            return {
                grades,
                streams: grades.flatMap(grade => grade.streams)
            };
        } catch (error) {
            console.error('Error fetching grades and streams:', error);
            throw new Error('Failed to fetch school data');
        }
    }

    /**
     * Get streams for a specific grade
     * @param {number} gradeId 
     * @returns {Promise<Array>}
     */
    async getStreamsByGrade(gradeId) {
        try {
            const streams = await prisma.stream.findMany({
                where: {
                    gradeId: parseInt(gradeId),
                    grade: {
                        schoolId: this.schoolId
                    }
                },
                select: {
                    id: true,
                    name: true
                },
                orderBy: {
                    name: 'asc'
                }
            });

            return streams;
        } catch (error) {
            console.error(`Error fetching streams for grade ${gradeId}:`, error);
            throw new Error('Failed to fetch streams');
        }
    }

    /**
     * Validate if a stream belongs to a grade in this school
     * @param {number} gradeId 
     * @param {number} streamId 
     * @returns {Promise<boolean>}
     */
    async validateGradeAndStream(gradeId, streamId) {
        try {
            const stream = await prisma.stream.findFirst({
                where: {
                    id: parseInt(streamId),
                    gradeId: parseInt(gradeId),
                    grade: {
                        schoolId: this.schoolId
                    }
                }
            });

            return !!stream;
        } catch (error) {
            console.error('Error validating grade and stream:', error);
            throw new Error('Failed to validate grade and stream');
        }
    }
     /**
     * Get all form options needed for student registration
     * @returns {Promise<Object>}
     */
     async getStudentRegistrationOptions() {
        try {
            // Get grades and streams
            const { grades, streams } = await this.getGradesAndStreams();

            // Get current term
            const currentTerm = await this.getCurrentTerm();

            return {
                grades,
                streams,
                currentTerm
            };
        } catch (error) {
            console.error('Error fetching registration options:', error);
            throw new Error('Failed to fetch registration options');
        }
    }
}

module.exports = SchoolDataService;
