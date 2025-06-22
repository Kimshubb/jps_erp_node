const prisma = require('./prismaClient');

class FeesUtility {
    static async getGradeInfo(grade, currentTerm, schoolId) {
      const feeStructure = await prisma.feeStructure.findFirst({
        where: {
          gradeId: grade.id,
          termId: currentTerm.id,
          schoolId,
        },
      });
  
      const totalStudents = await prisma.student.count({
        where: {
          gradeId: grade.id,
          schoolId,
        },
      });
  
      const expectedFees =
        feeStructure
          ? feeStructure.tuitionFee +
            feeStructure.assBooks +
            feeStructure.diaryFee +
            feeStructure.activityFee +
            feeStructure.others
          : 0;
  
      const totalFeesPaid = await prisma.$queryRaw`
        SELECT SUM(fp.amount) AS total_fees_paid
        FROM fee_payments fp
        JOIN students s ON fp.student_id = s.student_id
        WHERE s.grade_id = ${grade.id}
          AND s.school_id = ${schoolId}
          AND fp.term_id = ${currentTerm.id}
      `;
  
      return {
        gradeName: grade.name,
        expectedFees,
        totalFeesPaid: totalFeesPaid[0].total_fees_paid,
        totalBalance: expectedFees - totalFeesPaid[0].total_fees_paid,
        totalStudents,
      };
    }
  
    static async getAdditionalFeesInfo(grade, currentTerm, schoolId) {
      const additionalFees = await prisma.$queryRaw`
        SELECT
          af.fee_name,
          COUNT(s.student_id) AS student_count,
          SUM(af.amount) AS total_amount,
          GROUP_CONCAT(s.full_name) AS student_names
        FROM additional_fees af
        JOIN additional_fee_students afs ON af.id = afs.additional_fee_id
        JOIN students s ON afs.student_id = s.student_id
        WHERE s.grade_id = ${grade.id}
          AND s.school_id = ${schoolId}
          AND s.current_term_id = ${currentTerm.id}
        GROUP BY af.id
      `;
  
      return additionalFees.map((fee) => ({
        feeName: fee.fee_name,
        studentCount: fee.student_count,
        totalAmount: fee.total_amount,
        students: fee.student_names.split(','),
      }));
    }
  
    static async getPaymentMethodComparison(currentTerm, previousTerm, schoolId) {
      const getCurrentPaymentMethods = async (term) => {
        const methods = await prisma.$queryRaw`
          SELECT
            fp.method,
            SUM(fp.amount) AS total_amount
          FROM fee_payments fp
          WHERE fp.term_id = ${term.id}
            AND fp.school_id = ${schoolId}
          GROUP BY fp.method
        `;
  
        const total = methods.reduce((acc, method) => acc + method.total_amount, 0);
  
        return methods.reduce(
          (acc, method) => ({
            ...acc,
            [method.method]: (method.total_amount / total) * 100,
          }),
          {}
        );
      };
  
      const currentMethods = await getCurrentPaymentMethods(currentTerm);
      const currentTotal = Object.values(currentMethods).reduce((acc, value) => acc + value, 0);
  
      let previousMethods = {};
      let previousTotal = 0;
  
      if (previousTerm) {
        previousMethods = await getCurrentPaymentMethods(previousTerm);
        previousTotal = Object.values(previousMethods).reduce((acc, value) => acc + value, 0);
      }
  
      return {
        current: currentMethods,
        previous: previousTotal > 0 ? previousMethods : {},
      };
    }
  
    static async getTermComparison(currentTerm, previousTerm, schoolId) {
      const getTermData = async (term) => {
        if (!term) {
          return {};
        }
  
        const grades = await prisma.grade.findMany({ where: { schoolId } });
        const termData = {};
  
        for (const grade of grades) {
          const totalFees = await prisma.$queryRaw`
            SELECT SUM(fp.amount) AS total_fees
            FROM fee_payments fp
            JOIN students s ON fp.student_id = s.student_id
            WHERE s.grade_id = ${grade.id}
              AND s.school_id = ${schoolId}
              AND fp.term_id = ${term.id}
          `;
  
          const additionalFees = await prisma.$queryRaw`
            SELECT
              SUM(af.amount) AS total_amount,
              COUNT(s.student_id) AS student_count
            FROM additional_fees af
            JOIN additional_fee_students afs ON af.id = afs.additional_fee_id
            JOIN students s ON afs.student_id = s.student_id
            WHERE s.grade_id = ${grade.id}
              AND s.school_id = ${schoolId}
              AND s.current_term_id = ${term.id}
          `;
  
          termData[grade.name] = {
            totalFees: totalFees[0].total_fees,
            additionalFees: additionalFees[0].total_amount || 0,
            additionalFeesCount: additionalFees[0].student_count || 0,
          };
        }
  
        return termData;
      };
  
      return {
        current: await getTermData(currentTerm),
        previous: await getTermData(previousTerm),
      };
    }
  
    static async getAdditionalFeesComparison(currentTerm, previousTerm, schoolId) {
      const getAdditionalFeesData = async (term) => {
        if (!term) {
          return {};
        }
  
        const grades = await prisma.grade.findMany({ where: { schoolId } });
        const termData = {};
  
        for (const grade of grades) {
          const additionalFees = await prisma.$queryRaw`
            SELECT
              SUM(af.amount) AS total_amount,
              COUNT(s.student_id) AS student_count
            FROM additional_fees af
            JOIN additional_fee_students afs ON af.id = afs.additional_fee_id
            JOIN students s ON afs.student_id = s.student_id
            WHERE s.grade_id = ${grade.id}
              AND s.school_id = ${schoolId}
              AND s.current_term_id = ${term.id}
          `;
  
          termData[grade.name] = {
            totalAmount: additionalFees[0].total_amount || 0,
            studentCount: additionalFees[0].student_count || 0,
          };
        }
  
        return termData;
      };
  
      return {
        current: await getAdditionalFeesData(currentTerm),
        previous: await getAdditionalFeesData(previousTerm),
      };
    }
  }

module.exports = FeesUtility;
  