// src/routes/paymentRoutes.js
const express = require('express');
const { newPayment, printReceipt, getStudentsWithFilters, studentPayments, getAllPayments, exportPayments, feeReports, getStudentFeeStatement } = require('../controllers/paymentController');
//const { body } = require('express-validator');
//const { isAuthenticated } = require('../middleware/authMiddleware'); // Custom middleware for authentication

const router = express.Router();

/* Route for adding new payment
router.post(
    '/new_payment',
    isAuthenticated,
    [
        body('student_id').notEmpty().withMessage('Student ID is required'),
        body('amount').isNumeric().withMessage('Amount must be a number'),
        body('method').isIn(['Cash', 'Mpesa', 'Bank']).withMessage('Invalid payment method')
    ],
    newPayment
);*/

router.post('/new', newPayment);

// Route to fetch all payments
// GET /api/payments
router.get('/all-recent-payments', getAllPayments);


// Route to fetch a receipt
// GET /api/payments/student/:studentId/receipt/:paymentId
router.get('/student/:studentId/receipt/:paymentId', printReceipt);

// Route to fetch a student fee statement
app.get('/students/:studentId/fee-statement', getStudentFeeStatement);


// Route to fetch all students payments
// GET /api/payments/view
router.get('/view', studentPayments);

// Route to fetch students $ associated additonal payments
// GET /api/payments/view-addfee
router.get('/view-addfees', getStudentsWithFilters);

// Route to export payments
// GET /api/payments/export
router.get('/export', exportPayments);

// Route to fetch fee reports
// GET /api/payments/fee-reports
router.get('/fee-reports', feeReports);

/**  Define the student payments route
router.get('/student_payments', isAuthenticated, studentPayments);

// Route for generating student receipt or fee statement
router.get('/student/:studentId/receipt/:paymentId', isAuthenticated, printReceipt);

// Route for fetching all recent payments
router.get('/recent_payments', isAuthenticated, recentPayments);

// Route for generating fee reports
router.get('/fee_reports', isAuthenticated, feeReports);

// Route for searching student payments
router.get('/search_student_payments', isAuthenticated, searchStudentPayments);

Route for adding an additional fee to a student
router.route('/student/:studentId/add_fee')
    .get(isAuthenticated, addAdditionalFee)  // Fetch additional fees
    .post(isAuthenticated, addAdditionalFee); // Associate additional fee with student*/


module.exports = router;
