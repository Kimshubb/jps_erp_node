// Seed fee structures for a specific school
//  - Generates random fee structures for each grade in the school
//  - Fee components are calculated based on grade level
//  - Requires a valid school ID as an argument
//  - Run this script with the command `node seedFeeStructures.js <schoolId>`
//  - Example: `node seedFeeStructures.js 1`
// src/seedutils/seedFeeStructures.js
require('dotenv').config();
const prisma = require('../utils/prismaClient');

/**
 * Generates a random float within a specified range
 * @param {number} min - Minimum value 
 * @param {number} max - Maximum value
 * @returns {number} Randomly generated float with two decimal places
 */
const randomFloat = (min, max) => {
  return Number((Math.random() * (max - min) + min).toFixed(2));
};

/**
 * Calculates fee components with intelligent variations based on grade name
 * @param {string} gradeName - Name of the grade
 * @returns {Object} Structured fee components
 */
const calculateFeeTiers = (gradeName) => {
  // Base multipliers for different grade levels
  const multipliers = {
    'Playgroup': 0.7,
    'PP1': 0.8,
    'PP2': 0.9,
    'Grade 1': 1.0,
    'Grade 2': 1.1,
    'Grade 3': 1.2,
    'Grade 4': 1.3,
    'Grade 5': 1.4,
    'Grade 6': 1.5,
    'Grade 7': 1.6,
    'Grade 8': 1.7
  };

  const baseMultiplier = multipliers[gradeName] || 1;

  return {
    tuitionFee: randomFloat(5000 * baseMultiplier, 20000 * baseMultiplier),
    assBooks: randomFloat(500 * baseMultiplier, 2000),
    diaryFee: randomFloat(100, 500),
    activityFee: randomFloat(500 * baseMultiplier, 2000),
    others: randomFloat(200, 1000)
  };
};

/**
 * Populates fee structures for all grades in a specific school
 * @param {number} schoolId - ID of the school to populate fee structures for
 * @returns {Promise<boolean>} - Indicates successful population
 */
const populateFeeStructures = async (schoolId) => {
  try {
    // Find the current active term
    const currentTerm = await prisma.term.findFirst({
      where: { current: true }
    });

    if (!currentTerm) {
      console.error('No active term found. Please ensure an active term exists.');
      return false;
    }

    // Fetch grades for the specified school
    const grades = await prisma.grade.findMany({
      where: { schoolId: schoolId }
    });

    if (grades.length === 0) {
      console.log(`No grades found for school with ID ${schoolId}`);
      return false;
    }

    // Create fee structures for each grade
    for (const grade of grades) {
      // Check if fee structure already exists
      const existingFeeStructure = await prisma.feeStructure.findUnique({
        where: {
          unique_school_grade: {
            schoolId: schoolId,
            gradeId: grade.id
          }
        }
      });

      if (existingFeeStructure) {
        console.log(`Fee structure already exists for grade: ${grade.name}. Skipping.`);
        continue;
      }

      // Calculate fee components
      const feeComponents = calculateFeeTiers(grade.name);

      // Create new fee structure
      await prisma.feeStructure.create({
        data: {
          ...feeComponents,
          schoolId: schoolId,
          gradeId: grade.id,
          termId: currentTerm.id
        }
      });

      console.log(`Created fee structure for grade: ${grade.name}`);
    }

    console.log('Fee structures population completed successfully.');
    return true;

  } catch (error) {
    console.error('Error populating fee structures:', error);
    return false;
  } finally {
    await prisma.$disconnect();
  }
};

// Check if script is run directly
if (require.main === module) {
  // Get school ID from command line arguments
  const schoolId = parseInt(process.argv[2]);

  // Validate school ID
  if (isNaN(schoolId)) {
    console.error('Please provide a valid school ID as an argument.');
    console.error('Example: node src/seedutils/seedFeeStructures.js 1');
    process.exit(1);
  }

  populateFeeStructures(schoolId)
    .then((success) => process.exit(success ? 0 : 1))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { populateFeeStructures };