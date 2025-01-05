// src/seedutils/seedInitialGrades.js
// this file contains a function that populates the grades table with initial grades for a school. The function takes a school ID as an argument and creates the following grades if they do not already exist: Playgroup, PP1, PP2, Grade 1, Grade 2, Grade 3, Grade 4, Grade 5, Grade 6, Grade 7, Grade 8.
const prisma = require('../utils/prismaClient');

const populateInitialGrades = async (schoolId) => {
    const gradesToCreate = [
        'Playgroup', 'PP1', 'PP2', 
        'Grade 1', 'Grade 2', 'Grade 3', 
        'Grade 4', 'Grade 5', 'Grade 6', 
        'Grade 7', 'Grade 8', 'Grade 9'
    ];

    try {
        for (const gradeName of gradesToCreate) {
            const existingGrade = await prisma.grade.findFirst({
                where: { 
                    name: gradeName, 
                    schoolId: schoolId 
                }
            });

            if (!existingGrade) {
                await prisma.grade.create({
                    data: { 
                        name: gradeName, 
                        schoolId: schoolId 
                    }
                });
                console.log(`Created grade: ${gradeName}`);
            }
        }

        console.log('Initial grades population completed successfully.');
        return true;
    } catch (error) {
        console.error('Error populating initial grades:', error);
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
        console.error('Example: node src/utils/seedInitialGrades.js 1');
        process.exit(1);
    }

    populateInitialGrades(schoolId)
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { populateInitialGrades };
