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
    const { username, userId, role, schoolId } = req.user;
    console.log("Destructured User data:", { username, userId, role, schoolId });

    const schoolDataService = new SchoolDataService(schoolId);
    console.log('Schoolid from user:', schoolId);

    try {
        console.log('Adding student:', req.method, req.body);
        // Handle GET request: Return grades, streams, and terms
        if (req.method === 'GET') {
            console.log('Fetching form options for adding student');
            const registrationOptions = await schoolDataService.getStudentRegistrationOptions();
            if (!registrationOptions) {
                console.error('Failed to fetch registration options.');
                return res.status(400).json({ message: 'Failed to fetch registration options.' });
            }
            console.log('Form options:', { registrationOptions });

            return res.json(registrationOptions);
        }

        // Handle POST request: Validate data and create a new student
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({ errors: errors.array() });
        }

        const { full_name, dob, gender, guardian_name, contact_number1, contact_number2, grade_id, stream_id } = req.body;
        const currentTerm = await schoolDataService.getCurrentTerm();

        // Validate grade and stream combination
        const isValidCombination = await schoolDataService.validateGradeAndStream(
            grade_id, 
            stream_id
        );

        if (!isValidCombination) {
            return res.status(400).json({ 
                message: 'Invalid grade and stream combination' 
            });
        }

        if (!currentTerm) {
            return res.status(400).json({ message: 'No current term set for this school.' });
        }

        //const school = await prisma.school.findUnique({
           // where: { id: schoolId }
        //});
        //const studentId = `${school.code}-${school.studentsCount + 1}`;
        const currentYear = DateTime.now().year;

        // Create the new student
        const student = await prisma.student.create({
            data: {
                student_id: studentId,
                full_name,
                dob: new Date(dob),
                gender,
                guardian_name,
                contact_number1,
                contact_number2,
                gradeId: parseInt(grade_id),
                streamId: parseInt(stream_id),
                schoolId,
                year: currentYear,
                currentTermId: currentTerm.id,
                isActive: true
            }
        });

        res.status(201).json({ message: 'Student successfully registered!', student });

    } catch (error) {
        console.error('Error in addStudent:', error);
        if (error.message === 'No active term found for this school') {
            return res.status(400).json({ 
                message: 'Cannot register student: No active term set for this school' 
            });
        }
        res.status(500).json({ 
            message: 'An error occurred while processing your request' 
        });
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