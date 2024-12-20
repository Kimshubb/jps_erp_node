// src/seedutils/deleteSchoolTeachers.js
const prisma = require('../utils/prismaClient');

async function deleteSchoolTeachers(schoolId) {
    if (!schoolId) {
        console.error('Please provide a school ID as an argument');
        process.exit(1);
    }

    console.log('\n=== Deleting School Teachers Start ===');
    console.log(`School ID: ${schoolId}`);

    try {
        // First verify the school exists
        const school = await prisma.school.findUnique({
            where: { id: parseInt(schoolId) }
        });

        if (!school) {
            console.error(`School with ID ${schoolId} not found`);
            process.exit(1);
        }

        // Count teachers before deletion
        const teacherCount = await prisma.user.count({
            where: {
                schoolId: parseInt(schoolId),
                role: 'teacher'
            }
        });

        console.log(`Found ${teacherCount} teachers in school ${school.name}`);

        if (teacherCount === 0) {
            console.log('No teachers to delete in this school');
            return true;
        }

        // First delete all subject assignments for these teachers
        const { count: deletedAssignments } = await prisma.streamSubjectTeacher.deleteMany({
            where: {
                teacher: {
                    user: {
                        schoolId: parseInt(schoolId)
                    }
                }
            }
        });

        console.log(`Deleted ${deletedAssignments} subject assignments`);

        // Delete teacher profiles
        const { count: deletedProfiles } = await prisma.teacherProfile.deleteMany({
            where: {
                user: {
                    schoolId: parseInt(schoolId),
                    role: 'teacher'
                }
            }
        });

        console.log(`Deleted ${deletedProfiles} teacher profiles`);

        // Delete teacher users
        const { count: deletedUsers } = await prisma.user.deleteMany({
            where: {
                schoolId: parseInt(schoolId),
                role: 'teacher'
            }
        });

        console.log(`Deleted ${deletedUsers} teacher user accounts`);
        console.log('\n=== Teacher Deletion Complete ===');
        console.log(`Total teachers deleted: ${deletedUsers}`);

        return true;

    } catch (error) {
        console.error('Error deleting teachers:', error);
        return false;
    } finally {
        await prisma.$disconnect();
    }
}

// Check if script is run directly
if (require.main === module) {
    // Get school ID from command line arguments
    const schoolId = parseInt(process.argv[2]);

    // Validate school ID
    if (isNaN(schoolId)) {
        console.error('Please provide a valid school ID as an argument.');
        console.error('Example: node src/seedutils/deleteSchoolTeachers.js 1');
        process.exit(1);
    }

    deleteSchoolTeachers(schoolId)
        .then((success) => {
            if (success) {
                console.log('Teachers deletion completed successfully.');
                process.exit(0);
            } else {
                console.error('Teachers deletion failed.');
                process.exit(1);
            }
        })
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { deleteSchoolTeachers };