const express = require('express');
const { addStudent, getStudents } = require('../controllers/StudentController');
console.log("Add student function:", addStudent);
const { body, param } = require('express-validator');
//const { authenticateToken } = require('../middleware/authMiddleware');
//console.log("IsAuthenticated function:", authenticateToken);

const router = express.Router();

// Utility to handle async errors
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};



router.get('/view-students', getStudents);
//Route for adding a student
router.route('/add')
    .get( asyncHandler(addStudent))
    .post(
        [
            body('fullName').notEmpty().withMessage('Full name is required'),
            body('dob').notEmpty().withMessage('Date of birth is required'),
            body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
            body('guardianName').notEmpty().withMessage('Guardian name is required'),
            body('contactNumber1').notEmpty().withMessage('Primary contact number is required'),
            body('contactNumber2').optional().isMobilePhone().withMessage('Secondary contact number is invalid'),
            body('cfBalance').optional().isFloat({ min: 0 }).withMessage('Carry forward balance must be a non-negative number.'),
            body('grade_id').notEmpty().withMessage('Grade is required'),
            body('stream_id').notEmpty().withMessage('Stream is required')
        ],
        asyncHandler(addStudent)
    );


/* Route for updating a student
router.route('/students/:studentId/update')
    .get(
        isAuthenticated,
        [
            param('studentId').isInt().withMessage('Invalid student ID')
        ],
        asyncHandler(updateStudent)
    )
    .post(
        isAuthenticated,
        [
            body('full_name').optional().notEmpty().withMessage('Full name cannot be empty'),
            body('dob').optional().notEmpty().withMessage('Date of birth cannot be empty'),
            body('gender').optional().isIn(['Male', 'Female', 'Other']).withMessage('Invalid gender'),
            body('guardian_name').optional().notEmpty().withMessage('Guardian name cannot be empty'),
            body('contact_number1').optional().notEmpty().withMessage('Primary contact number cannot be empty'),
            body('contact_number2').optional().isMobilePhone().withMessage('Secondary contact number is invalid'),
            body('grade_id').optional().notEmpty().withMessage('Grade cannot be empty'),
            body('stream_id').optional().notEmpty().withMessage('Stream cannot be empty'),
            param('studentId').isInt().withMessage('Invalid student ID')
        ],
        asyncHandler(updateStudent)
    );

// Route for toggling a student's active status
router.patch('/students/:studentId/status',
    isAuthenticated,
    [
        param('studentId').isInt().withMessage('Invalid student ID')
    ],
    asyncHandler(toggleStudentStatus)
);*/

module.exports = router;
