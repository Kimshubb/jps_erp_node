// src/routes/studentRoutes.js
const express = require('express');
const { getStudents } = require('../controllers/studentController');
const { loginRequired } = require('../middleware/authMiddleware');

const router = express.Router();

// Route for fetching students with filters and pagination
router.get('/students', loginRequired, getStudents);

// Route for adding a student
router.route('/students/add')
    .get(loginRequired, addStudent)  // Fetch form options
    .post(
        loginRequired,
        [
            body('full_name').notEmpty().withMessage('Full name is required'),
            body('dob').isDate().withMessage('Date of birth must be a valid date'),
            body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Gender is invalid'),
            body('contact_number1').notEmpty().withMessage('Primary contact number is required'),
            body('grade_id').notEmpty().withMessage('Grade is required'),
            body('stream_id').notEmpty().withMessage('Stream is required')
        ],
        addStudent
    );

// Route for updating a student
router.route('/students/:studentId/update')
    .get(loginRequired, updateStudent)  // Fetch student details for form
    .post(loginRequired, updateStudent); // Update student details

// Route for toggling a student's active status
router.post('/students/:studentId/inactive', loginRequired, toggleStudentStatus);

module.exports = router;
