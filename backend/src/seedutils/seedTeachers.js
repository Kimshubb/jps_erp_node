// src/seedutils/seedInitialTeachers.js
// Path: backend/src/seedutils/seedInitialTeachers.js
// to run this script, run the following command in the terminal:
// node src/seedutils/seedInitialTeachers.js <schoolId>
// Example: node src/seedutils/seedInitialTeachers.js 1
// This script seeds teachers for a school based on the number of streams in each grade. It calculates the number of teachers needed to cover all streams and seeds them accordingly.
// The default password for all seeded teachers is 'defaultPassword123'. This should be changed immediately after login.

require('dotenv').config();
const prisma = require('../utils/prismaClient');
const bcrypt = require('bcrypt');

const seedTeachers = async (schoolId) => {
    console.log('\n=== Seeding Teachers Start ===');
    console.log(`School ID: ${schoolId}`);

    try {
        // First, fetch all streams for the specified school
        const gradesWithStreams = await prisma.grade.findMany({
            where: { schoolId },
            include: { 
                streams: true 
            }
        });

        // Count total streams
        const totalStreams = gradesWithStreams.reduce((total, grade) => {
            return total + grade.streams.length;
        }, 0);

        console.log(`Total Streams Found: ${totalStreams}`);

        // Fetch existing teachers for this school
        const existingTeachers = await prisma.user.count({
            where: { 
                schoolId, 
                role: 'TEACHER', 
                isActive: true
            }
        });

        console.log(`Existing Teachers: ${existingTeachers}`);

        // Calculate number of teachers to seed
        const teachersToSeed = totalStreams - existingTeachers;

        if (teachersToSeed <= 0) {
            console.log('No additional teachers need to be seeded');
            return true;
        }

        // Seed new teachers
        const teachersData = [];
        for (let i = 1; i <= teachersToSeed; i++) {
            const username = `teacheruser${existingTeachers + i}`;
            const email = `teacheruser${existingTeachers + i}@school.com`;
            
            const teacherUser = await prisma.user.create({
                data: {
                    username,
                    email,
                    role: 'teacher',
                    passwordHash: await bcrypt.hash('defaultPassword123', 10), // Secure default password
                    schoolId,
                    isActive: true
                }
            });

            // Create corresponding teacher profile
            const teacherProfile = await prisma.teacherProfile.create({
                data: {
                    userId: teacherUser.id,
                    schoolId
                }
            });

            teachersData.push({
                user: teacherUser,
                profile: teacherProfile
            });

            console.log(`Seeded Teacher: ${username}`);
        }

        console.log(`=== Seeding Teachers Complete ===`);
        console.log(`Total Teachers Seeded: ${teachersData.length}`);

        return true;
    } catch (error) {
        console.error('Error seeding teachers:', error);
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
        console.error('Example: node src/seedutils/seedInitialTeachers.js 1');
        process.exit(1);
    }

    seedTeachers(schoolId)
        .then((success) => {
            if (success) {
                console.log('Teachers seeding completed successfully.');
                process.exit(0);
            } else {
                console.error('Teachers seeding failed.');
                process.exit(1);
            }
        })
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { seedTeachers };