require('dotenv').config();
const yargs = require('yargs');
const bcrypt = require('bcrypt');
const prisma = require('./utils/prismaClient');

yargs.command({
    command: 'create-admin',
    describe: 'Create a new admin user',
    builder: {
        username: { describe: 'Admin username', type: 'string', demandOption: true },
        email: { describe: 'Admin email', type: 'string', demandOption: true },
        password: { describe: 'Admin password', type: 'string', demandOption: true },
        schoolName: { describe: 'School name', type: 'string', demandOption: true },
        schoolContacts: { describe: 'School contacts', type: 'string', demandOption: true },
    },
    handler: async (argv) => {
        const { username, email, password, schoolName, schoolContacts } = argv;

        try {
            // Check if user with provided email already exists
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

            // Hash the password with bcrypt (10 salt rounds)
            const hashedPassword = await bcrypt.hash(password, 10);

            // Create the new admin user in the database
            await prisma.user.create({
                data: {
                    username,
                    email,
                    passwordHash: hashedPassword,
                    role: 'admin',
                    schoolId: school.id,
                },
            });

            console.log(`Admin user ${username} created successfully.`);
        } catch (error) {
            console.error(`Error creating admin: ${error.message}`);
        } finally {
            // Ensure that the Prisma client disconnects after completion
            await prisma.$disconnect();
        }
    },
});

// Parse CLI arguments
yargs.parse();
