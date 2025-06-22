//src/controllers/settingsController.js
const prisma = require('../utils/prismaClient');
const { validationResult } = require('express-validator');
const bcrypt = require('bcrypt');

// GET and POST route handler
const manageTerms = async (req, res) => {
    if (req.method === 'GET') {
        try {
            // Fetch all terms for the user's school
            const terms = await prisma.term.findMany({
                where: { schoolId: req.user.schoolId },
            });
            res.json({ terms });
        } catch (error) {
            console.error('Error fetching terms:', error);
            res.status(500).json({ error: 'Server error. Unable to retrieve terms.' });
        }
    } else if (req.method === 'POST') {
        // Run validation checks
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { term_id, name, year, startDate, endDate, current } = req.body;
        const schoolId = req.user.schoolId;

        try {
            let term;

            // Check if the term already exists with the same name and year
            const existingTerm = await prisma.term.findFirst({
                where: { name, year: parseInt(year), schoolId }
            });

            if (term_id) {
                // Update an existing term if term_id is provided
                term = await prisma.term.findUnique({ where: { id: parseInt(term_id) } });
                if (!term) {
                    return res.status(404).json({ error: 'Term not found.' });
                }
            } else if (existingTerm) {
                return res.status(400).json({ error: `Term ${name} already exists for the year ${year}.` });
            } else {
                // Create a new term if term_id is not provided
                term = await prisma.term.create({
                    data: { name, year:parseInt(year), schoolId, startDate: new Date(startDate), endDate: new Date(endDate) }
                });
            }

            // If marked as current, unset the current flag for all other terms in the same school
            if (current) {
                await prisma.term.updateMany({
                    where: { schoolId, current: true },
                    data: { current: false }
                });
            }

            // Update or set term fields
            term = await prisma.term.update({
                where: { id: term.id },
                data: {
                    name,
                    startDate: new Date(startDate),
                    endDate: new Date(endDate),
                    year: parseInt(year),
                    current: current || false
                }
            });

            res.json({ message: 'Term has been added/updated successfully!', term });
        } catch (error) {
            console.error('Error managing term:', error);
            res.status(500).json({ error: 'Server error. Unable to manage term.' });
        }
    }
};


// GET and POST route handler for managing fee structure
/**
 * api to manage fee structure
 * GET /api/settings/fee-structure
 * POST /api/settings/fee-structure
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
const manageFeeStructure = async (req, res) => {
    const schoolId = req.user.schoolId;
    console.log('Manage Fee Structure School ID:', schoolId);

    if (req.method === 'GET') {
        try {
            const termFilter = req.query.term || 'all';
            const gradeFilter = req.query.grade || 'all';

            const feeStructuresQuery = { schoolId };

            if (termFilter !== 'all') feeStructuresQuery.termId = parseInt(termFilter);
            if (gradeFilter !== 'all') feeStructuresQuery.gradeId = parseInt(gradeFilter);

            const feeStructures = await prisma.feeStructure.findMany({
                where: feeStructuresQuery,
                include: { grade: true, term: true }, // Include grade and term details
            });

            res.json({ success: true, feeStructures });
        } catch (error) {
            console.error('Error fetching fee structure:', error);
            res.status(500).json({ success: false, error: 'Unable to retrieve fee structure data.' });
        }
    } else if (req.method === 'POST') {
        console.log('Processing POST request...');
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ success: false, errors: errors.array() });
        }

        const { fee_structure_id, grade, term_id, tuition_fee, ass_books, diary_fee, activity_fee, others } = req.body;

        try {
            // Validate term and grade
            const term = await prisma.term.findUnique({ where: { id: parseInt(term_id) } });
            const gradeExists = await prisma.grade.findUnique({ where: { id: parseInt(grade) } });

            if (!term) return res.status(400).json({ success: false, error: 'Invalid term.' });
            if (!gradeExists) return res.status(400).json({ success: false, error: 'Invalid grade.' });

            // Update existing fee structure
            if (fee_structure_id) {
                let feeStructure = await prisma.feeStructure.findUnique({ where: { id: parseInt(fee_structure_id) } });
                if (!feeStructure) {
                    return res.status(404).json({ success: false, error: 'Fee structure not found.' });
                }

                // Check if the update would violate the uniqueness constraint
                const conflictingFeeStructure = await prisma.feeStructure.findFirst({
                    where: {
                        NOT: { id: parseInt(fee_structure_id) }, // Exclude the current fee structure
                        gradeId: parseInt(grade),
                        termId: parseInt(term_id),
                        schoolId,
                    },
                });

                if (conflictingFeeStructure) {
                    return res.status(400).json({ success: false, error: 'Fee structure for this grade and term already exists.' });
                }

                feeStructure = await prisma.feeStructure.update({
                    where: { id: parseInt(fee_structure_id) },
                    data: {
                        gradeId: parseInt(grade),
                        termId: parseInt(term_id),
                        tuitionFee: parseFloat(tuition_fee),
                        assBooks: parseFloat(ass_books),
                        diaryFee: parseFloat(diary_fee),
                        activityFee: parseFloat(activity_fee),
                        others: parseFloat(others || 0),
                    },
                });

                return res.json({ success: true, message: 'Fee structure updated successfully!', feeStructure });
            }

            // Create new fee structure
            const existingFeeStructure = await prisma.feeStructure.findFirst({
                where: { gradeId: parseInt(grade), termId: parseInt(term_id), schoolId },
            });

            if (existingFeeStructure) {
                return res.status(400).json({ success: false, error: 'Fee structure for this grade and term already exists.' });
            }

            const feeStructure = await prisma.feeStructure.create({
                data: {
                    gradeId: parseInt(grade),
                    termId: parseInt(term_id),
                    tuitionFee: parseFloat(tuition_fee),
                    assBooks: parseFloat(ass_books),
                    diaryFee: parseFloat(diary_fee),
                    activityFee: parseFloat(activity_fee),
                    others: parseFloat(others || 0),
                    schoolId,
                },
            });
            console.log()

            res.json({ success: true, message: 'Fee structure created successfully!', feeStructure });
        } catch (error) {
            if (error.code === 'P2002') {
                return res.status(400).json({ success: false, error: 'Fee structure already exists.' });
            }
            console.error('Error managing fee structure:', error);
            res.status(500).json({ success: false, error: 'Unable to manage fee structure.' });
        }
    } else {
        res.status(405).json({ success: false, error: 'Method not allowed.' });
    }
};

const createAdditionalFee = async (req, res) => {
    const { feeName, amount } = req.body;
    const schoolId = req.user.schoolId; // Extract schoolId from the authenticated user's token

    /* Ensure the user has the appropriate role
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden. Admin role required.' });
    }*/

    try {
        // Check if an additional fee with the same name already exists for the school
        const existingFee = await prisma.additionalFee.findFirst({
            where: { feeName, schoolId },
        });

        if (existingFee) {
            return res.status(400).json({ error: `An additional fee named "${feeName}" already exists.` });
        }

        // Create the new additional fee
        const newFee = await prisma.additionalFee.create({
            data: {
                feeName,
                amount: parseFloat(amount),
                schoolId,
            },
        });

        res.status(201).json({ message: 'Additional fee created successfully.', additionalFee: newFee });
    } catch (error) {
        console.error('Error creating additional fee:', error);
        res.status(500).json({ error: 'Failed to create additional fee.' });
    }
};

const getAdditionalFees = async (req, res) => {
    const schoolId = req.user.schoolId;
    console.log('Fetching additional fees for schoolId:', schoolId);

    try {
        const additionalFees = await prisma.additionalFee.findMany({
            where: { schoolId },
        });
        console.log('Fetched additional fees:', additionalFees);
        res.json({ additionalFees });
    } catch (error) {
        console.error('Error fetching additional fees:', error);
        res.status(500).json({ error: 'Failed to fetch additional fees.' });
    }
};

// GET and POST route handler for migrating terms
// GET /api/settings/migrate-term
// POST /api/settings/migrate-term
const migrateTerm = async (req, res) => {
    const schoolId = req.user.schoolId;

    // Handle GET request to fetch terms and current term
    if (req.method === 'GET') {
        try {
            const terms = await prisma.term.findMany({ where: { schoolId } });
            const currentTerm = await prisma.term.findFirst({ where: { current: true, schoolId } });

            res.json({ terms, currentTerm });
        } catch (error) {
            console.error('Error fetching terms:', error);
            res.status(500).json({ error: 'Unable to retrieve terms.' });
        }
    }

    // Handle POST request to migrate terms
    else if (req.method === 'POST') {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { term_id } = req.body;

        try {
            // Unset the current flag for the existing term
            const currentTerm = await prisma.term.updateMany({
                where: { current: true, schoolId },
                data: { current: false }
            });

            // Set the new term as the current term
            const newTerm = await prisma.term.update({
                where: { id: parseInt(term_id), schoolId },
                data: { current: true }
            });

            // Migrate active students to the new term
            const activeStudents = await prisma.student.updateMany({
                where: { schoolId, active: true },
                data: { currentTermId: newTerm.id }
            });

            res.json({ message: 'Students migrated successfully!', newTerm });
        } catch (error) {
            console.error('Error migrating term:', error);
            res.status(500).json({ error: 'Unable to migrate term.' });
        }
    }
};

// GET and POST route handler for configuring grades
// GET /api/settings/configure-grades
// POST /api/settings/configure-grades
const configureGrades = async (req, res) => {
    const schoolId = req.user.schoolId; // Ensure this comes from the authenticated user's token/session
    console.log('\n=== Configure Grades Handler Start ===');
    console.log('User Info:', {
        userId: req.user.userId,
        schoolId: req.user.schoolId,
        role: req.user.role
    });

    if (req.method === 'GET') {
        console.log('Processing GET request...');
        try {
            console.log('Attempting to fetch grades for schoolId:', schoolId);
            const grades = await prisma.grade.findMany({
                where: { schoolId },
                include: { streams: true }
            });
            console.log('Fetched grades:', grades);
            return res.json({ grades });
        } catch (error) {
            console.error('Error fetching grades:', error);
            return res.status(500).json({ error: 'Unable to retrieve grades.' });
        }
    }

    if (req.method === 'POST') {
        console.log('Processing POST request...');
        const { grades } = req.body;
        console.log('Received grades:', req.body);

        if (!grades || !Array.isArray(grades)) {
            console.log('Invalid input. `grades` must be an array.');
            return res.status(400).json({ error: 'Invalid input. `grades` must be an array.' });
        }

        try {
            console.log('Configuring grades for schoolId:', schoolId);  
            for (const gradeData of grades) {
                let grade = await prisma.grade.findFirst({
                    where: { name: gradeData.name, schoolId }
                });
                console.log('Existing Grade Found:', grade);

                if (!grade) {
                    console.log('Creating new grade:', gradeData.name);
                    grade = await prisma.grade.create({
                        data: { name: gradeData.name, schoolId }
                    });
                    console.log('New Grade Created:', grade);
                }

                const existingStreams = await prisma.stream.findMany({
                    where: { gradeId: grade.id },
                    select: { name: true }
                });
                console.log('Existing Streams:', existingStreams);  

                const existingStreamNames = existingStreams.map((stream) => stream.name);

                for (const streamName of gradeData.streams) {
                    if (!existingStreamNames.includes(streamName)) {
                        await prisma.stream.create({
                            data: { name: streamName, gradeId: grade.id }
                        });
                        console.log('New Stream Created:', streamName);
                    }
                }
            }

            return res.json({ message: 'Grades and streams successfully configured!' });
        } catch (error) {
            console.error('Error configuring grades:', error);
            return res.status(500).json({ error: 'Unable to configure grades and streams.', details: error.message, stack: error.stack });
        }
    }
};

const getUsers = async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            where: {
                schoolId: req.user.schoolId, // Filter users by the logged-in user's school
            },
            select: {
                id: true,
                username: true,
                email: true,
                role: true,
                isActive: true, // Include the active status
                schoolId: true,
            },
        });
        res.json(users);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.status(500).json({ error: 'Failed to fetch users.' });
    }
};

const createUser = async (req, res) => {
    const { username, email, role, password } = req.body;

    // Restrict role creation if not admin
    if (req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Forbidden. Admin role required.' });
    }

    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.user.create({
            data: {
                username,
                email,
                role,
                passwordHash: hashedPassword,
                schoolId: req.user.schoolId, // Assign schoolId from the token
                ...(role === 'teacher' && { 
                    teacherProfile: {
                         create: {
                            schoolId: req.user.schoolId
                         }
                    } 
                })
            },
            include: {
                teacherProfile: true
            }
        });
        res.status(201).json({ message: 'User created successfully.', user: {...newUser, passwordHash: undefined} });
    } catch (err) {
        console.error('Error creating user:', err);
        if (err.code === 'P2002') {
            return res.status(400).json({ error: 'User with this email already exists.' });
        }
        res.status(500).json({ error: 'Failed to create user.' });
    }
};

const toggleUserStatus = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(req.params.id) },
        });

        // Ensure the user belongs to the same school and exists
        if (!user || user.schoolId !== req.user.schoolId) {
            return res.status(404).json({ error: 'User not found or unauthorized.' });
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: { isActive: !user.isActive }, // Toggle the active status
        });

        res.json({ isActive: updatedUser.isActive });
    } catch (err) {
        console.error('Error toggling user status:', err);
        res.status(500).json({ error: 'Failed to toggle user status.' });
    }
};



module.exports = {manageTerms, configureGrades, manageFeeStructure, createUser, getUsers, toggleUserStatus, createAdditionalFee, getAdditionalFees }; // Export functions for use in routes
// In the code snippet above, we have defined route handlers for managing terms, fee structures, additional fees, migrating terms, and configuring grades. These handlers interact with the Prisma ORM to perform CRUD operations on the database and return appropriate responses to the client.
