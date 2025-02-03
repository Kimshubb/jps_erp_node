// src/controllers/studentController.js
const prisma = require('../utils/prismaClient');
const { validationResult } = require('express-validator');
const { DateTime } = require('luxon');
//const SchoolDataService = require('../utils/schoolDataService');


/**
 * Fetches students with pagination and filters for grade, term, and stream.
 * GET /api/students
 */

const getStudents = async (req, res) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1);
    const gradeFilter = req.query.grade || 'all';
    const activeFilter = req.query.active || 'all'; // New active filter
    const streamFilter = req.query.stream || 'all';
    const perPage = 15;
    const schoolId = req.user.schoolId;

    try {
        // Build the base filter for students
        let studentFilter = { schoolId };
        if (gradeFilter !== 'all' && !isNaN(gradeFilter)) studentFilter.gradeId = parseInt(gradeFilter);
        if (streamFilter !== 'all' && !isNaN(streamFilter)) studentFilter.streamId = parseInt(streamFilter);
        
        // Add active filter logic
        if (activeFilter !== 'all') {
            studentFilter.active = activeFilter === 'true'; // Convert to boolean
        }

        // Fetch paginated students based on filters
        const students = await prisma.student.findMany({
            where: studentFilter,
            skip: (page - 1) * perPage,
            take: perPage,
            include: {
                grade: { select: { name: true } },
                stream: { select: { name: true } }
            }
        });

        // Fetch total count for pagination
        const totalStudents = await prisma.student.count({
            where: studentFilter
        });

        // Fetch grades and streams for filter options
        const grades = await prisma.grade.findMany({ 
            where: { schoolId }, 
            select: { id: true, name: true } 
        });
        const streams = await prisma.stream.findMany({
            where: {
                grade: { schoolId: schoolId },
            },
            select: { id: true, name: true }
        });

        // Return response with paginated students and filters
        res.json({
            students,
            grades,
            streams,
            pagination: {
                page,
                perPage,
                total: totalStudents,
                totalPages: Math.ceil(totalStudents / perPage)
            }
        });
    } catch (error) {
        console.error('Error fetching students:', error);
        res.status(500).json({ message: 'An error occurred while fetching students.' });
    }
};

/**
 * Handles adding a new student with grade, stream, and school validation.
 * GET /api/students/add - Retrieve form options
 * POST /api/students/add - Add a new student
 */
const addStudent = async (req, res) => {
    if (!req.user) {
        console.error('Unauthorized: User information is missing.');
        return res.status(401).json({ message: 'Unauthorized: User information is missing.' });
    }

    const { schoolId } = req.user;

    try {
        
        if (req.method === 'GET') {
            console.log('GET /api/students/add - Fetching grades, streams, and current term');
            console.log('User schoolId:', schoolId);
            // Fetch grades and streams
            const grades = await prisma.grade.findMany({
                where: { schoolId },
                include: { streams: true },
                orderBy: { name: 'asc' }
            });
            console.log('Fetched Grades:', grades);

            const streams = grades.flatMap(grade => grade.streams);
            console.log('Fetched Streams:', streams);
            console.log('Fetched grades with detailed streams:', JSON.stringify(grades, null, 2));

            // Fetch current term
            const currentTerm = await prisma.term.findFirst({
                where: {
                    schoolId,
                    current: true
                }
            });
            console.log('Fetched Current Term:', currentTerm);

            if (!currentTerm) {
                console.log('No active term set for this school.');
                return res.status(400).json({ message: 'No active term set for this school.' });
            }
            console.log('Returning form options:', { grades, streams, currentTerm });

            return res.json({
                grades,
                streams,
                currentTerm
            });
        }

        if (req.method === 'POST') {
            console.log('POST /api/students/add - Adding a new student');
            console.log('Received data:', req.body);
            // Validate the input data
            const errors = validationResult(req);
            if (!errors.isEmpty()) {
                console.log('Validation errors:', errors.array());
                return res.status(400).json({ errors: errors.array() });
            }

            const { 
                fullName, dob, gender, guardianName, 
                contactNumber1, contactNumber2, grade_id, stream_id, cfBalance
            } = req.body;

            // Validate grade and stream combination
            console.log('Validating grade and stream:', { grade_id, stream_id });
            const isValidCombination = await prisma.stream.findFirst({
                where: {
                    id: parseInt(stream_id),
                    gradeId: parseInt(grade_id),
                    grade: { schoolId }
                }
            });
            console.log('Combination validation result:', isValidCombination);

            if (!isValidCombination) {
                console.log('Invalid grade and stream combination.');
                return res.status(400).json({ message: 'Invalid grade and stream combination.' });
            }

            // Fetch current term
            const currentTerm = await prisma.term.findFirst({
                where: {
                    schoolId,
                    current: true
                }
            });


            if (!currentTerm) {
                return res.status(400).json({ message: 'No active term set for this school.' });
            }

            // Generate a unique student ID (custom logic can be added here)
            const school = await prisma.school.findUnique({
                where: { id: schoolId }
            });

            const studentsCount = await prisma.student.count({
                where: { schoolId }
            });

            const studentId = `SCH-${schoolId}-${studentsCount + 1}`;
            console.log('Generated student ID:', studentId);

            // Create the new student
            const student = await prisma.student.create({
                data: {
                    id: studentId,
                    fullName,
                    dob: new Date(dob),
                    gender,
                    guardianName,
                    contactNumber1,
                    contactNumber2,
                    cfBalance: parseFloat(cfBalance) || 0.0,
                    gradeId: parseInt(grade_id),
                    streamId: parseInt(stream_id),
                    schoolId,
                    year: DateTime.now().year,
                    currentTermId: currentTerm.id,
                    active: true
                }
            });
            console.log('Student created:', student);

            return res.status(201).json({ 
                message: 'Student successfully registered!', 
                student 
            });
        }

        res.status(405).json({ message: 'Method Not Allowed' });
    } catch (error) {
        console.error('Error in addStudent:', error);
        res.status(500).json({ message: 'An error occurred while processing your request.' });
    }
};

const updateStudent = async (req, res) => {
    const { studentId } = req.params;
    const { schoolId } = req.user;  // Assuming this comes from auth middleware

    try {
        // Get student data along with related grade and stream data
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                grade: true,
                stream: true
            }
        });

        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Get all grades for the school
        const grades = await prisma.grade.findMany({
            where: { schoolId },
            select: {
                id: true,
                name: true
            },
            orderBy: {
                name: 'asc'
            }
        });

        // Get streams for the valid grades
        const validGradeIds = grades.map(grade => grade.id);
        const streams = await prisma.stream.findMany({
            where: {
                gradeId: { in: validGradeIds }
            },
            select: {
                id: true,
                name: true,
                gradeId: true
            }
        });

        res.json({
            student,
            grades,
            streams
        });

    } catch (error) {
        console.error('Error fetching student data:', error);
        res.status(500).json({ 
            message: 'An error occurred while fetching student data',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

/**
 * Toggles a student's active status.
 * POST /api/students/:studentId/inactive
 */
const toggleStudentStatus = async (req, res) => {
    const { studentId } = req.params;
    const schoolId = req.user.schoolId; // Add schoolId from authentication
    console.log("Student ID:", studentId);
    console.log("School ID:", schoolId);

    try {
        // Fetch the student with the unique combination of studentId and schoolId
        const student = await prisma.student.findUnique({
            where: { 
                id_schoolId: { 
                    id: studentId, 
                    schoolId 
                } 
            }
        });

        if (!student) {
            console.error("Student not found for ID:", studentId, "and School ID:", schoolId);
            return res.status(404).json({ message: 'Student not found' });
        }

        // Toggle the active status and set `left_date` if inactive
        const updatedStudent = await prisma.student.update({
            where: { 
                id_schoolId: { 
                    id: studentId, 
                    schoolId 
                } 
            },
            data: {
                active: !student.active,
                leftDate: student.active ? new Date() : null, // Set left_date when becoming inactive
            }
        });
        console.log('Updated student:', updatedStudent);

        const status = updatedStudent.active ? 'active' : 'inactive';
        res.json({ 
            message: `Student marked as ${status}!`, 
            student: {
                id: updatedStudent.id,
                fullName: updatedStudent.fullName,
                active: updatedStudent.active,
                leftDate: updatedStudent.leftDate
            }
        });
    } catch (error) {
        console.error('Error toggling student status:', error);
        res.status(500).json({ message: 'An error occurred while updating the student status.' });
    }
};

const getStudentById = async (req, res) => {
    const { studentId } = req.params;
    const schoolId = req.user.schoolId;

    try {
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                grade: { select: { name: true } },
                stream: { select: { name: true } }
            }
        });

        if (!student || student.schoolId !== schoolId) {
            return res.status(404).json({ message: 'Student not found or does not belong to this school.' });
        }

        const grades = await prisma.grade.findMany({
            where: { schoolId },
            select: { id: true, name: true }
        });
        const streams = await prisma.stream.findMany({
            where: {
                grade: {
                    schoolId: schoolId // Explicitly filter grades by schoolId
                }
            },
            select: {
                id: true,
                name: true,
                gradeId: true // Include gradeId to verify relationships if necessary
            }
        });

        res.json({ student, grades, streams });
    } catch (error) {
        console.error('Error fetching student:', error);
        res.status(500).json({ message: 'An error occurred while fetching the student.' });
    }
};


const updateStudentAdditionalFees = async (req, res) => {
    const { studentId } = req.params;
    const { additionalFeeId, action } = req.body; // `action` can be 'subscribe' or 'unsubscribe'

    try {
        // Validate student
        const student = await prisma.student.findUnique({
            where: { id: studentId },
        });

        if (!student) {
            return res.status(404).json({ error: 'Student not found.' });
        }

        if (action === 'subscribe') {
            // Subscribe the student to the additional fee
            await prisma.student.update({
                where: { id: studentId },
                data: {
                    additionalFees: {
                        connect: { id: additionalFeeId },
                    },
                },
            });
            res.json({ message: 'Subscribed successfully.' });
        } else if (action === 'unsubscribe') {
            // Unsubscribe the student from the additional fee
            await prisma.student.update({
                where: { id: studentId },
                data: {
                    additionalFees: {
                        disconnect: { id: additionalFeeId },
                    },
                },
            });
            res.json({ message: 'Unsubscribed successfully.' });
        } else {
            res.status(400).json({ error: 'Invalid action specified.' });
        }
    } catch (error) {
        console.error('Error updating student additional fees:', error);
        res.status(500).json({ error: 'Failed to update additional fees.' });
    }
};

const getStudentAdditionalFees = async (req, res) => {
    const { studentId } = req.params;

    try {
        const student = await prisma.student.findUnique({
            where: { id: studentId },
            include: {
                additionalFees: true, // Fetch associated additional fees
            },
        });

        if (!student) {
            return res.status(404).json({ error: 'Student not found.' });
        }

        res.json(student.additionalFees);
    } catch (error) {
        console.error('Error fetching student additional fees:', error);
        res.status(500).json({ error: 'Failed to fetch additional fees.' });
    }
};

const associateStudentWithFee = async (req, res) => {
    const { studentId, additionalFeeId } = req.body;

    try {
        // Validate student and additional fee existence
        const student = await prisma.student.findUnique({
            where: { id: studentId },
        });

        const additionalFee = await prisma.additionalFee.findUnique({
            where: { id: additionalFeeId },
        });

        if (!student || !additionalFee) {
            return res.status(404).json({ error: 'Student or Additional Fee not found.' });
        }

        // Check if the student belongs to the same school as the fee
        if (student.schoolId !== additionalFee.schoolId) {
            return res.status(400).json({
                error: 'Student and additional fee do not belong to the same school.',
            });
        }

        // Associate the student with the additional fee
        await prisma.student.update({
            where: { id: studentId },
            data: {
                additionalFees: {
                    connect: { id: additionalFeeId },
                },
            },
        });

        res.json({ message: 'Student successfully associated with the additional fee.' });
    } catch (error) {
        console.error('Error associating student with fee:', error);
        res.status(500).json({ error: 'Failed to associate student with the fee.' });
    }
};

module.exports = { 
    addStudent,  
    getStudents,
    toggleStudentStatus,
    updateStudent,
    getStudentById,
    updateStudentAdditionalFees,
    getStudentAdditionalFees,
    associateStudentWithFee,
 };