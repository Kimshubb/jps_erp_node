// src/controllers/studentController.js
const prisma = require('../utils/prismaClient');
const { validationResult } = require('express-validator');
const { DateTime } = require('luxon');
const SchoolDataService = require('../utils/schoolDataService');


/**
 * Fetches students with pagination and filters for grade, term, and stream.
 * GET /api/students
 */

const getStudents = async (req, res) => {
    const page = Math.max(parseInt(req.query.page) || 1, 1); // Ensure valid page number
    const gradeFilter = req.query.grade || 'all';
    const termFilter = req.query.term || 'all';
    const streamFilter = req.query.stream || 'all';
    const perPage = 15;
    const schoolId = req.user.schoolId; // Assume req.user is populated by authentication middleware

    try {
        // Build the base filter for students
        let studentFilter = { schoolId };
        if (gradeFilter !== 'all' && !isNaN(gradeFilter)) studentFilter.gradeId = parseInt(gradeFilter);
        if (termFilter !== 'all' && !isNaN(termFilter)) studentFilter.currentTermId = parseInt(termFilter);
        if (streamFilter !== 'all' && !isNaN(streamFilter)) studentFilter.streamId = parseInt(streamFilter);

        // Fetch paginated students based on filters
        const students = await prisma.student.findMany({
            where: studentFilter,
            skip: (page - 1) * perPage,
            take: perPage,
            include: {
                grade: { select: { name: true } },
                stream: { select: { name: true } },
                currentTerm: { select: { name: true } }
            }
        });

        // Fetch total count for pagination
        const totalStudents = await prisma.student.count({
            where: studentFilter
        });

        // Fetch grades, terms, and streams for filter options
        const grades = await prisma.grade.findMany({ where: { schoolId }, select: { id: true, name: true } });
        const terms = await prisma.term.findMany({ where: { schoolId }, select: { id: true, name: true } });
        const streams = await prisma.stream.findMany({ where: { schoolId }, select: { id: true, name: true } });

        // Return response with paginated students and filters
        res.json({
            students,
            grades,
            terms,
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
                contactNumber1, contactNumber2, grade_id, stream_id 
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

    try {
        // Fetch the student
        const student = await prisma.student.findUnique({
            where: { student_id: studentId }
        });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Handle GET request: Return student details for form population
        if (req.method === 'GET') {
            return res.json({ student });
        }

        // Handle POST request: Update student data
        const { full_name, dob, gender, guardian_name, contact_number1, contact_number2, grade_id, stream_id } = req.body;

        const updatedStudent = await prisma.student.update({
            where: { student_id: studentId },
            data: {
                full_name,
                dob: new Date(dob),
                gender,
                guardian_name,
                contact_number1,
                contact_number2,
                gradeId: parseInt(grade_id),
                streamId: parseInt(stream_id)
            }
        });

        res.json({ message: 'Student details updated successfully!', student: updatedStudent });

    } catch (error) {
        console.error('Error updating student:', error);
        res.status(500).json({ message: 'An error occurred while updating the student.' });
    }
};


/**
 * Toggles a student's active status.
 * POST /api/students/:studentId/inactive
 */
const toggleStudentStatus = async (req, res) => {
    const { studentId } = req.params;

    try {
        // Fetch the student
        const student = await prisma.student.findUnique({
            where: { student_id: studentId }
        });
        if (!student) {
            return res.status(404).json({ message: 'Student not found' });
        }

        // Toggle the active status and set `left_date` if inactive
        const updatedStudent = await prisma.student.update({
            where: { student_id: studentId },
            data: {
                isActive: !student.active,
                left_date: student.active ? DateTime.now().toISODate() : null
            }
        });

        const status = updatedStudent.active ? 'active' : 'inactive';
        res.json({ message: `Student marked as ${status}!`, student: updatedStudent });

    } catch (error) {
        console.error('Error toggling student status:', error);
        res.status(500).json({ message: 'An error occurred while updating the student status.' });
    }
};

module.exports = { 
    addStudent,  
    getStudents
 };