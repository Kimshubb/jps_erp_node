require('dotenv').config();
const inquirer = require('inquirer');
const bcrypt = require('bcrypt');
const prisma = require('./utils/prismaClient');
const {populateInitialGrades} = require('./seedutils/seedGrades');
const {seedSubjects} = require('./seedutils/seedSubjects');

// Function to prompt the user for input
const promptUser = async () => {
    return inquirer.prompt([
        {
            type: 'input',
            name: 'username',
            message: 'Enter admin username:',
            validate: input => input ? true : 'Username is required.',
        },
        {
            type: 'input',
            name: 'email',
            message: 'Enter admin email:',
            validate: input => /\S+@\S+\.\S+/.test(input) ? true : 'Please enter a valid email.',
        },
        {
            type: 'password',
            name: 'password',
            message: 'Enter admin password:',
            validate: input => input.length >= 8 ? true : 'Password should be at least 8 characters.',
        },
        {
            type: 'input',
            name: 'schoolName',
            message: 'Enter school name:',
            validate: input => input ? true : 'School name is required.',
        },
        {
            type: 'input',
            name: 'schoolContacts',
            message: 'Enter school contact details:',
            validate: input => input ? true : 'Contact details are required.',
        },
        {
            type: 'input',
            name: 'termName',
            message: 'Enter the initial term name (e.g., Fall, Spring):',
            validate: input => input ? true : 'Term name is required.',
        },
        {
            type: 'number',
            name: 'termYear',
            message: 'Enter the initial term year:',
            validate: input => Number.isInteger(input) && input > 2000 ? true : 'Please enter a valid year.',
        },
        {
            type: 'input',
            name: 'startDate',
            message: 'Enter the start date of the term (YYYY-MM-DD):',
            validate: input => !isNaN(Date.parse(input)) ? true : 'Please enter a valid date in YYYY-MM-DD format.',
        },
        {
            type: 'input',
            name: 'endDate',
            message: 'Enter the end date of the term (YYYY-MM-DD):',
            validate: input => !isNaN(Date.parse(input)) ? true : 'Please enter a valid date in YYYY-MM-DD format.',
        },
        {
            type: 'confirm',
            name: 'setCurrent',
            message: 'Set this term as the current term?',
            default: true,
        }
    ]);
};

// Function to create admin and set up initial data
// Modified createAdmin function to include grade and subject seeding
const createAdmin = async (answers) => {
    const { username, email, password, schoolName, schoolContacts, termName, termYear, startDate, endDate, setCurrent } = answers;

    try {
        // Check if the user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });
        if (existingUser) {
            console.log('Error: User with this email already exists.');
            return;
        }

        // Check if the school already exists; if not, create it
        let school = await prisma.school.findUnique({
            where: { name: schoolName },
        });
        if (!school) {
            school = await prisma.school.create({
                data: {
                    name: schoolName,
                    contacts: schoolContacts,
                },
            });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the new admin user
        const adminUser = await prisma.user.create({
            data: {
                username,
                email,
                passwordHash: hashedPassword,
                role: 'admin',
                schoolId: school.id,
            },
        });

        console.log(`Admin user ${username} created successfully.`);

        // Seed initial grades for the school
        const gradesSeeded = await populateInitialGrades(school.id);
        if (!gradesSeeded) {
            console.error('Failed to seed initial grades.');
            return;
        }

        // Seed subjects for the school
        const subjectsSeeded = await seedSubjects(prisma, school.id);
        if (!subjectsSeeded) {
            console.error('Failed to seed subjects.');
            return;
        }

        // Check if the term exists; if not, create it
        let term = await prisma.term.findFirst({
            where: {
                name: termName,
                year: termYear,
                schoolId: school.id,
            }
        });

        if (!term) {
            term = await prisma.term.create({
                data: {
                    name: termName,
                    year: termYear,
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    current: setCurrent,
                    schoolId: school.id,
                },
            });
            console.log(`Term ${termName} (${termYear}) created successfully.`);
        } else {
            console.log(`Term ${termName} (${termYear}) already exists.`);
        }

        // Set term as current if specified
        if (setCurrent) {
            await prisma.term.updateMany({
                where: {
                    schoolId: school.id,
                    id: { not: term.id },
                },
                data: { current: false },
            });
            await prisma.term.update({
                where: { id: term.id },
                data: { current: true },
            });
            console.log(`Term ${termName} (${termYear}) set as the current term.`);
        }

        console.log('School setup completed successfully!');
    } catch (error) {
        console.error(`Error creating admin: ${error.message}`);
    } finally {
        await prisma.$disconnect();
    }
};
// Run the prompt and create admin
promptUser().then(createAdmin).catch(error => {
    console.error(`Error: ${error.message}`);
});

module.exports = { promptUser, createAdmin, seedSubjects };
