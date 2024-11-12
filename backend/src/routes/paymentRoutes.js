// src/routes/paymentRoutes.js
const express = require('express');
const { newPayment } = require('../controllers/paymentController');
const { body } = require('express-validator');
const { loginRequired } = require('../middleware/authMiddleware'); // Custom middleware for authentication

const router = express.Router();

// Route for adding new payment
router.post(
    '/new_payment',
    loginRequired,
    [
        body('student_id').notEmpty().withMessage('Student ID is required'),
        body('amount').isNumeric().withMessage('Amount must be a number'),
        body('method').isIn(['Cash', 'Mpesa', 'Bank']).withMessage('Invalid payment method')
    ],
    newPayment
);
// Define the student payments route
router.get('/student_payments', loginRequired, studentPayments);

// Route for generating student receipt or fee statement
router.get('/student/:studentId/receipt/:paymentId', loginRequired, printReceipt);

// Route for fetching all recent payments
router.get('/recent_payments', loginRequired, recentPayments);

// Route for generating fee reports
router.get('/fee_reports', loginRequired, feeReports);

// Route for searching student payments
router.get('/search_student_payments', loginRequired, searchStudentPayments);

module.exports = router;
