//src/controllers/authController.js
const prisma = require('../utils/prismaClient');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const login = async (req, res) => {
    const { username, password } = req.body;
    console.log('Login attempt for username:', username);

    try {
        // Find user by username
        const user = await prisma.user.findUnique({
            where: { username },
            select: { id: true, username: true, passwordHash: true, role: true, schoolId: true },
        });

        if (!user) {
            // User not found
            console.log(`User ${username} not found.`);
            return res.status(401).json({
                code: 'USER_NOT_FOUND', 
                message: 'Invalid credentials.' 
            });
        }

        // Compare provided password with stored hashed password
        const isPasswordMatch = await bcrypt.compare(password, user.passwordHash);

        if (!isPasswordMatch) {
            // Passwords do not match
            console.log(`User ${username} entered an incorrect password.`);
            return res.status(401).json({
                code: 'INVALID_PASSWORD', 
                message: 'Invalid credentials.' 
            });
        }
        const tokenPayload = {
            userId: user.id,
            username: user.username,
            role: user.role,
            schoolId: user.schoolId
        };
        console.log('Creating token with payload:', tokenPayload);

        // If login successful, generate JWT token
        const token = jwt.sign(
            tokenPayload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );
        console.log('Token created successfully');
        // Set CORS headers explicitly for login response
        //res.header('Access-Control-Allow-Credentials', 'true');
        //res.header('Access-Control-Allow-Origin', req.headers.origin);

        return res.json({ message: 'Login successful', token, user: { id: user.id, username: user.username, role: user.role, schoolId: user.schoolId } });

    } catch (error) {
        console.error(`Error logging in user ${username}:`, error);
        return res.status(500).json({ message: 'Server error. Please try again.' });
    }
};

const createUser = async (req, res) => {
    const { username, email, role, password } = req.body;
    const schoolId = req.user.schoolId; // Assuming the school ID is associated with the current user

    try {
        // Check the user count for the school
        const userCount = await prisma.user.count({
            where: { schoolId },
        });

        if (userCount >= 5) {
            return res.status(400).json({ error: 'Maximum number of users (5) reached for this school.' });
        }

        // Hash the password
        const hashedPassword = await bcrypt.hash(password, 10);

        // Create the new user
        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                role,
                passwordHash: hashedPassword,
                schoolId,
                isActive: true,
            },
        });

        res.status(201).json({ success: true, user: { username: newUser.username, email: newUser.email } });
    } catch (error) {
        console.error(error);
        if (error.code === 'P2002') {
            // Prisma error code for unique constraint violation
            res.status(400).json({ error: 'Username or email already exists.' });
        } else {
            res.status(500).json({ error: 'Internal server error.' });
        }
    }
};

module.exports = { createUser, login }; // Export functions for use in routes


