// src/routes/paymentRoutes.js
const express = require('express');
const { newPayment, studentPayments, printReceipt, recentPayments, feeReports, searchStudentPayments, addAdditionalFee } = require('../controllers/paymentController');
const { body } = require('express-validator');
const { isAuthenticated } = require('../middleware/authMiddleware'); // Custom middleware for authentication

const router = express.Router();

// Route for adding new payment
router.post(
    '/new_payment',
    isAuthenticated,
    [
        body('student_id').notEmpty().withMessage('Student ID is required'),
        body('amount').isNumeric().withMessage('Amount must be a number'),
        body('method').isIn(['Cash', 'Mpesa', 'Bank']).withMessage('Invalid payment method')
    ],
    newPayment
);
// Define the student payments route
router.get('/student_payments', isAuthenticated, studentPayments);

// Route for generating student receipt or fee statement
router.get('/student/:studentId/receipt/:paymentId', isAuthenticated, printReceipt);

// Route for fetching all recent payments
router.get('/recent_payments', isAuthenticated, recentPayments);

// Route for generating fee reports
router.get('/fee_reports', isAuthenticated, feeReports);

// Route for searching student payments
router.get('/search_student_payments', isAuthenticated, searchStudentPayments);

// Route for adding an additional fee to a student
router.route('/student/:studentId/add_fee')
    .get(isAuthenticated, addAdditionalFee)  // Fetch additional fees
    .post(isAuthenticated, addAdditionalFee); // Associate additional fee with student


module.exports = router;
