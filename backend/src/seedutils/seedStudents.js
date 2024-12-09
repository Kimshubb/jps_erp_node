// src/seedutils/seedStudents.js
//run this script to populate students in the database
// Usage: node src/seedutils/seedStudents.js <schoolId> <studentsPerGrade>
// Example: node src/seedutils/seedStudents.js 1 5
const prisma = require('../utils/prismaClient');

const generateRandomName = (gender) => {
    const firstNames = {
        male: ['John', 'Michael', 'David', 'James', 'Robert', 'William', 'Daniel', 'Joseph', 'Samuel', 'Christopher'],
        female: ['Emma', 'Olivia', 'Sophia', 'Isabella', 'Ava', 'Mia', 'Charlotte', 'Amelia', 'Harper', 'Emily']
    };

    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];

    const firstName = firstNames[gender][Math.floor(Math.random() * firstNames[gender].length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];

    return `${firstName} ${lastName}`;
};

const generateRandomContact = () => {
    return `+254${Math.floor(700000000 + Math.random() * 100000000)}`;
};

const generateDateOfBirth = (gradeName) => {
    const currentYear = new Date().getFullYear();
    const baseAge = {
        'Playgroup': 3,
        'PP1': 4,
        'PP2': 5,
        'Grade 1': 6,
        'Grade 2': 7,
        'Grade 3': 8,
        'Grade 4': 9,
        'Grade 5': 10,
        'Grade 6': 11,
        'Grade 7': 12,
        'Grade 8': 13
    };

    // Ensure the grade exists in our mapping
    if (!baseAge.hasOwnProperty(gradeName)) {
        throw new Error(`Unsupported grade: ${gradeName}`);
    }

    // Calculate year of birth
    const birthYear = currentYear - baseAge[gradeName] - Math.floor(Math.random() * 2);
    
    // Randomly generate month and day
    const birthMonth = Math.floor(Math.random() * 12);
    const birthDay = Math.floor(Math.random() * 28) + 1;

    // Create and return a valid Date object
    return new Date(birthYear, birthMonth, birthDay);
};

const populateStudents = async (schoolId, studentsPerGrade) => {
    try {
        // Fetch current term
        const currentTerm = await prisma.term.findFirst({
            where: {
                schoolId,
                current: true
            }
        });

        if (!currentTerm) {
            throw new Error('No active term set for this school.');
        }

        // Fetch grades for the school
        const grades = await prisma.grade.findMany({
            where: { schoolId },
            include: { streams: true }
        });

        // Keep track of total students created
        let totalStudentsCreated = 0;

        // Iterate through each grade
        for (const grade of grades) {
            // If no streams exist for this grade, create an 'East' stream
            if (grade.streams.length === 0) {
                const newStream = await prisma.stream.create({
                    data: {
                        name: 'East',
                        gradeId: grade.id
                    }
                });
                console.log(`Created stream 'East' for grade ${grade.name}`);
            }

            // Get the stream(s) for this grade
            const streams = await prisma.stream.findMany({
                where: { gradeId: grade.id }
            });

            // Populate students for this grade
            for (let i = 0; i < studentsPerGrade; i++) {
                // Alternate between streams if multiple exist
                const stream = streams[i % streams.length];

                // Randomly select gender
                const gender = Math.random() > 0.5 ? 'male' : 'female';

                // Generate unique student ID
                const studentsCount = await prisma.student.count({
                    where: { schoolId }
                });
                const studentId = `SCH-${schoolId}-${studentsCount + 1}`;

                // Generate date of birth
                const dob = generateDateOfBirth(grade.name);

                // Create student
                const student = await prisma.student.create({
                    data: {
                        id: studentId,
                        fullName: generateRandomName(gender),
                        dob,
                        gender,
                        guardianName: generateRandomName(Math.random() > 0.5 ? 'male' : 'female'),
                        contactNumber1: generateRandomContact(),
                        contactNumber2: generateRandomContact(),
                        gradeId: grade.id,
                        streamId: stream.id,
                        schoolId,
                        cfBalance: 0.0,
                        year: new Date().getFullYear(),
                        currentTermId: currentTerm.id,
                        active: true
                    }
                });

                totalStudentsCreated++;
                console.log(`Created student ${studentId} in ${grade.name} - ${stream.name}`);
            }
        }

        console.log(`Populated ${totalStudentsCreated} students across ${grades.length} grades.`);
        return totalStudentsCreated;
    } catch (error) {
        console.error('Error populating students:', error);
        throw error;
    } finally {
        await prisma.$disconnect();
    }
};

// Check if script is run directly
if (require.main === module) {
    // Get school ID and number of students per grade from command line arguments
    const schoolId = parseInt(process.argv[2]);
    const studentsPerGrade = parseInt(process.argv[3]);

    // Validate inputs
    if (isNaN(schoolId) || isNaN(studentsPerGrade)) {
        console.error('Please provide a valid school ID and number of students per grade.');
        console.error('Example: node src/seedutils/seedStudents.js 1 5');
        process.exit(1);
    }

    populateStudents(schoolId, studentsPerGrade)
        .then(() => process.exit(0))
        .catch((error) => {
            console.error(error);
            process.exit(1);
        });
}

module.exports = { populateStudents };