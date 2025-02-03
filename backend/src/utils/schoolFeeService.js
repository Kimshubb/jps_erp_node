const prisma = require('./prismaClient');

class StudentFeeService {
    constructor(schoolId, studentId, termId) {
      console.log(`🔍 StudentFeeService Initialized:`, {
        schoolId, 
        studentId, 
        termId,
        timestamp: new Date().toISOString()
      });

      this.schoolId = schoolId;
      this.studentId = studentId;
      this.termId = termId;
      this.student = null; // Cache student data
      this.feeStructure = null; // Cache fee structure
    }
  
    async #fetchStudent() {
      console.log(`📋 Fetching Student Details:`, {
        studentId: this.studentId,
        schoolId: this.schoolId,
        timestamp: new Date().toISOString()
      });

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
        console.warn(`⚠️ Student Not Found:`, {
          studentId: this.studentId,
          schoolId: this.schoolId,
          timestamp: new Date().toISOString()
        });
        throw new Error(`Student ${this.studentId} not found in school ${this.schoolId}`);
      }
  
      return this.student;
    }
  
    async #fetchFeeStructure() {
      console.log(`💰 Fetching Fee Structure:`, {
        studentId: this.studentId,
        schoolId: this.schoolId,
        termId: this.termId,
        timestamp: new Date().toISOString()
      });

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
  
    async getBalanceData() {
      try {
        console.log(`📊 Generating Balance Data:`, {
          studentId: this.studentId,
          schoolId: this.schoolId,
          termId: this.termId,
          timestamp: new Date().toISOString()
        });

        await this.#fetchStudent();
        await this.#fetchFeeStructure();
  
        const standardFees = this.feeStructure
          ? (this.feeStructure.tuitionFee || 0) +
            (this.feeStructure.assBooks || 0) +
            (this.feeStructure.diaryFee || 0) +
            (this.feeStructure.activityFee || 0) +
            (this.feeStructure.others || 0)
          : 0;
  
        const additionalFees = this.student.additionalFees.reduce(
          (sum, fee) => sum + (fee.amount || 0),
          0
        );
  
        const payments = await prisma.feePayment.aggregate({
          where: {
            studentId: this.studentId,
            termId: this.termId,
            schoolId: this.schoolId,
          },
          _sum: { amount: true },
        });

        const balanceData = {
          cfBalance: this.student.cfBalance || 0,
          standardFees,
          additionalFees,
          paidAmount: payments._sum?.amount || 0,
        };

        console.log(`📈 Balance Data Generated:`, balanceData);
  
        return balanceData;
      } catch (error) {
        console.error("❌ Failed to fetch balance data:", {
          error: error.message,
          studentId: this.studentId,
          schoolId: this.schoolId,
          termId: this.termId,
          timestamp: new Date().toISOString()
        });
        throw error;
      }
    }
  
    async calculateCurrentBalance() {
      console.log(`💳 Calculating Current Balance:`, {
        studentId: this.studentId,
        schoolId: this.schoolId,
        termId: this.termId,
        timestamp: new Date().toISOString()
      });

      const { cfBalance, standardFees, additionalFees, paidAmount } =
        await this.getBalanceData();
      
      const currentBalance = cfBalance + (standardFees + additionalFees - paidAmount);
      
      console.log(`💸 Current Balance Calculated:`, currentBalance);
      
      return currentBalance;
    }
  
    async feeStructureExists() {
      console.log(`🏦 Checking Fee Structure Existence:`, {
        studentId: this.studentId,
        schoolId: this.schoolId,
        termId: this.termId,
        timestamp: new Date().toISOString()
      });

      if (!this.feeStructure) await this.#fetchFeeStructure();
      
      const exists = !!this.feeStructure;
      console.log(`📝 Fee Structure Exists:`, exists);
      
      return exists;
    }
}

module.exports = StudentFeeService;