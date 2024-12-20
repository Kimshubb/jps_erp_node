// src/seedutils/resetAssignedSubjects.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function resetTeacherAssignments(schoolId) {
    if (!schoolId) {
        console.error('Please provide a school ID as an argument');
        process.exit(1);
    }

    try {
        // First verify the school exists
        const school = await prisma.school.findUnique({
            where: { id: parseInt(schoolId) },
        });

        if (!school) {
            console.error(`School with ID ${schoolId} not found`);
            process.exit(1);
        }

        // Get all teacher profiles from this school
        const teacherProfiles = await prisma.teacherProfile.findMany({
            where: {
                user: {
                    schoolId: parseInt(schoolId)
                }
            },
            include: {
                user: true,
                streamSubjectTeachers: true
            }
        });

        console.log(`Found ${teacherProfiles.length} teachers in school ${school.name}`);

        // Delete all subject assignments for these teachers
        const { count } = await prisma.streamSubjectTeacher.deleteMany({
            where: {
                teacher: {
                    user: {
                        schoolId: parseInt(schoolId)
                    }
                }
            }
        });

        console.log(`Successfully removed ${count} subject assignments`);
        console.log('Subject assignments reset complete!');

    } catch (error) {
        console.error('Error resetting subject assignments:', error);
        process.exit(1);
    } finally {
        await prisma.$disconnect();
    }
}

// Get school ID from command line argument
const schoolId = process.argv[2];
resetTeacherAssignments(schoolId)
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });