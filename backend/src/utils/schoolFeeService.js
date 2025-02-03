const prisma = require('./prismaClient');

class StudentFeeService {
    constructor(schoolId, studentId, termId) {
      this.schoolId = schoolId;
      this.studentId = studentId;
      this.termId = termId;
      this.student = null; // Cache student data
      this.feeStructure = null; // Cache fee structure
    }
  
    /**
     * Fetch student with grade and additional fees
     */
    async #fetchStudent() {
      this.student = await prisma.student.findUnique({
        where: { 
          id_schoolId: { 
            id: this.studentId, 
            schoolId: this.schoolId 
          } 
        },
        include: {
          grade: true,
          additionalFees: {
            where: { schoolId: this.schoolId },
          },
        },
      });
  
      if (!this.student) {
        throw new Error(`Student ${this.studentId} not found in school ${this.schoolId}`);
      }
  
      return this.student;
    }
  
    /**
     * Fetch fee structure for the student's grade and term
     */
    async #fetchFeeStructure() {
      if (!this.student) await this.#fetchStudent();
  
      this.feeStructure = await prisma.feeStructure.findUnique({
        where: {
          unique_school_grade_term: {
            schoolId: this.schoolId,
            gradeId: this.student.gradeId,
            termId: this.termId,
          },
        },
      });
  
      return this.feeStructure;
    }
  
    /**
     * Calculate total fees and payments
     */
    async getBalanceData() {
      try {
        await this.#fetchStudent();
        await this.#fetchFeeStructure();
  
        // Calculate standard fees (0 if no structure exists)
        const standardFees = this.feeStructure
          ? (this.feeStructure.tuitionFee || 0) +
            (this.feeStructure.assBooks || 0) +
            (this.feeStructure.diaryFee || 0) +
            (this.feeStructure.activityFee || 0) +
            (this.feeStructure.others || 0)
          : 0;
  
        // Calculate additional fees
        const additionalFees = this.student.additionalFees.reduce(
          (sum, fee) => sum + (fee.amount || 0),
          0
        );
  
        // Fetch payments
        const payments = await prisma.feePayment.aggregate({
          where: {
            studentId: this.studentId,
            termId: this.termId,
            schoolId: this.schoolId,
          },
          _sum: { amount: true },
        });
  
        return {
          cfBalance: this.student.cfBalance || 0,
          standardFees,
          additionalFees,
          paidAmount: payments._sum?.amount || 0,
        };
      } catch (error) {
        console.error("Failed to fetch balance data:", error);
        throw error;
      }
    }
  
    /**
     * Calculate the current balance
     */
    async calculateCurrentBalance() {
      const { cfBalance, standardFees, additionalFees, paidAmount } =
        await this.getBalanceData();
      return cfBalance + (standardFees + additionalFees - paidAmount);
    }
  
    /**
     * Check if fee structure exists for the grade/term
     */
    async feeStructureExists() {
      if (!this.feeStructure) await this.#fetchFeeStructure();
      return !!this.feeStructure;
    }
}