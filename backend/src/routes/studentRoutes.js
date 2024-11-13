// src/routes/studentRoutes.js
const express = require('express');
const { isAuthenticated } = require('../middleware/authMiddleware');
const { getStudents, addStudent, updateStudent, toggleStudentStatus } = require('../controllers/StudentController');
const { body } = require('express-validator');

const router = express.Router();

// Route for fetching students with filters and pagination
router.get('/students', async (req, res) => {
    try {
      const data = await getStudents(req, res);
      res.json(data);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
  });
// Route for adding a student
router.route('/students/add')
    .get(isAuthenticated, async (req, res, next) => {
        try {
            await addStudent(req, res, next);
        } catch (error) {
            next(error);
        }
    })
    .post(
        isAuthenticated,
        [
            body('full_name').notEmpty().withMessage('Full name is required'),
            body('dob').notEmpty().withMessage('Date of birth is required'),
            body('gender').isIn(['Male', 'Female', 'Other']).withMessage('Gender is invalid'),
            body('guardian_name').notEmpty().withMessage('Guardian name is required'),
            body('contact_number1').notEmpty().withMessage('Primary contact number is required'),
            body('contact_number2').optional().isMobilePhone().withMessage('Secondary contact number is invalid'),
            body('grade_id').notEmpty().withMessage('Grade is required'),
            body('stream_id').notEmpty().withMessage('Stream is required')
        ],
        async (req, res, next) => {
            try {
                await addStudent(req, res, next);
            } catch (error) {
                next(error);
            }
        }
    );

// Route for updating a student
router.route('/students/:studentId/update')
    .get(isAuthenticated, async (req, res, next) => {
        try {
            await updateStudent(req, res, next);
        } catch (error) {
            next(error);
        }
    })
    .post(isAuthenticated, async (req, res, next) => {
        try {
            await updateStudent(req, res, next);
        } catch (error) {
            next(error);
        }
    });

// Route for toggling a student's active status
router.post('/students/:studentId/inactive', isAuthenticated, async (req, res, next) => {
    try {
        await toggleStudentStatus(req, res, next);
    } catch (error) {
        next(error);
    }
});

module.exports = router;
