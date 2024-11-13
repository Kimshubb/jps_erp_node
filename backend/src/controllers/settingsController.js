//src/controllers/settingsController.js
const prisma = require('../utils/prismaClient');

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
                where: { name, year, schoolId }
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
                    data: { name, year, schoolId }
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
                    year,
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

    // Handle GET request to fetch fee structures, terms, and grades
    if (req.method === 'GET') {
        try {
            const terms = await prisma.term.findMany({ where: { schoolId } });
            const grades = await prisma.grade.findMany({ where: { schoolId } });

            const termFilter = req.query.term || 'all';
            const gradeFilter = req.query.grade || 'all';

            let feeStructuresQuery = { schoolId };

            if (termFilter !== 'all') {
                feeStructuresQuery.termId = parseInt(termFilter);
            }
            if (gradeFilter !== 'all') {
                feeStructuresQuery.gradeId = parseInt(gradeFilter);
            }

            const feeStructures = await prisma.feeStructure.findMany({
                where: feeStructuresQuery,
                include: { grade: true, term: true }
            });

            res.json({ feeStructures, terms, grades });
        } catch (error) {
            console.error('Error fetching fee structure:', error);
            res.status(500).json({ error: 'Unable to retrieve fee structure data.' });
        }
    }

    // Handle POST request to add or update a fee structure
    else if (req.method === 'POST') {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { fee_structure_id, grade, term_id, tuition_fee, ass_books, diary_fee, activity_fee, others } = req.body;

        try {
            const term = await prisma.term.findUnique({ where: { id: parseInt(term_id) } });
            const gradeExists = await prisma.grade.findUnique({ where: { id: parseInt(grade) } });

            if (!term || !gradeExists) {
                return res.status(400).json({ error: 'Invalid term or grade.' });
            }

            if (fee_structure_id) {
                // Update existing fee structure
                let feeStructure = await prisma.feeStructure.findUnique({ where: { id: parseInt(fee_structure_id) } });
                if (!feeStructure) {
                    return res.status(404).json({ error: 'Fee structure not found.' });
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
                        others: parseFloat(others)
                    }
                });

                res.json({ message: 'Fee structure updated successfully!', feeStructure });
            } else {
                // Check if fee structure already exists for the grade and term
                const existingFeeStructure = await prisma.feeStructure.findFirst({
                    where: { gradeId: parseInt(grade), termId: parseInt(term_id), schoolId }
                });

                if (existingFeeStructure) {
                    return res.status(400).json({ error: 'Fee structure for this grade and term already exists.' });
                }

                // Create a new fee structure
                const feeStructure = await prisma.feeStructure.create({
                    data: {
                        gradeId: parseInt(grade),
                        termId: parseInt(term_id),
                        tuitionFee: parseFloat(tuition_fee),
                        assBooks: parseFloat(ass_books),
                        diaryFee: parseFloat(diary_fee),
                        activityFee: parseFloat(activity_fee),
                        others: parseFloat(others),
                        schoolId
                    }
                });

                res.json({ message: 'Fee structure created successfully!', feeStructure });
            }
        } catch (error) {
            console.error('Error managing fee structure:', error);
            res.status(500).json({ error: 'Unable to manage fee structure.' });
        }
    }
};

/**
 *
 * @param {*} req 
 * @param {*} res 
 * @returns 
 */
// GET and POST route handler for managing additional fees
const manageAdditionalFees = async (req, res) => {
    const schoolId = req.user.schoolId;

    // Handle GET request to fetch additional fees
    if (req.method === 'GET') {
        try {
            const additionalFees = await prisma.additionalFee.findMany({
                where: { schoolId }
            });
            res.json({ additionalFees });
        } catch (error) {
            console.error('Error fetching additional fees:', error);
            res.status(500).json({ error: 'Unable to retrieve additional fees.' });
        }
    }

    // Handle POST request to add or update an additional fee
    else if (req.method === 'POST') {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { fee_name, amount } = req.body;

        try {
            // Check if the fee already exists for the current school
            let additionalFee = await prisma.additionalFee.findFirst({
                where: { feeName: fee_name, schoolId }
            });

            if (additionalFee) {
                // Update existing fee amount
                additionalFee = await prisma.additionalFee.update({
                    where: { id: additionalFee.id },
                    data: { amount: parseFloat(amount) }
                });
                res.json({ message: `Updated ${fee_name} to ${amount}`, additionalFee });
            } else {
                // Add a new additional fee
                additionalFee = await prisma.additionalFee.create({
                    data: {
                        feeName: fee_name,
                        amount: parseFloat(amount),
                        schoolId
                    }
                });
                res.json({ message: `Added ${fee_name} with amount ${amount}`, additionalFee });
            }
        } catch (error) {
            console.error('Error managing additional fees:', error);
            res.status(500).json({ error: 'Unable to manage additional fees.' });
        }
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
    const schoolId = req.user.schoolId;

    if (req.method === 'GET') {
        try {
            const grades = await prisma.grade.findMany({
                where: { schoolId },
                include: { streams: true }
            });
            res.json({ grades });
        } catch (error) {
            console.error('Error fetching grades:', error);
            res.status(500).json({ error: 'Unable to retrieve grades.' });
        }
    }

    else if (req.method === 'POST') {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { grades } = req.body;

        try {
            for (const gradeData of grades) {
                let grade = await prisma.grade.findFirst({
                    where: { name: gradeData.name, schoolId }
                });

                if (!grade) {
                    grade = await prisma.grade.create({
                        data: { name: gradeData.name, schoolId }
                    });
                }

                const existingStreams = await prisma.stream.findMany({
                    where: { gradeId: grade.id },
                    select: { name: true }
                });
                const existingStreamNames = existingStreams.map(s => s.name);

                for (const streamName of gradeData.streams) {
                    if (!existingStreamNames.includes(streamName)) {
                        await prisma.stream.create({
                            data: { name: streamName, gradeId: grade.id }
                        });
                    }
                }
            }

            res.json({ message: 'Grades and streams configured successfully!' });
        } catch (error) {
            console.error('Error configuring grades:', error);
            res.status(500).json({ error: 'Unable to configure grades and streams.' });
        }
    }
};



module.exports = { manageTerms, manageFeeStructure, manageAdditionalFees, migrateTerm, configureGrades }; // Export functions for use in routes
// In the code snippet above, we have defined route handlers for managing terms, fee structures, additional fees, migrating terms, and configuring grades. These handlers interact with the Prisma ORM to perform CRUD operations on the database and return appropriate responses to the client.
