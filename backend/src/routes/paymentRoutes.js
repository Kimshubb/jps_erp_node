// src/routes/paymentRoutes.js
const express = require('express');
const { newPayment, printReceipt, getStudentsWithFilters, studentPayments, getAllPayments, exportPayments, feeReports, getStudentFeeStatement } = require('../controllers/paymentController');


const router = express.Router();

// Middleware to log all requests to this route
router.use((req, res, next) => {
    console.log('Payment route accessed:', {
        method: req.method,
        path: req.path,
        params: req.params,
        query: req.query
    });
    next();
});

router.post('/new', newPayment);

// Route to fetch all payments
// GET /api/payments
router.get('/all-recent-payments', getAllPayments);


// Route to fetch a receipt
// GET /api/payments/student/:studentId/receipt/:paymentId
router.get('/student/:studentId/receipt/:paymentId', printReceipt);

//Route to fetch a student fee statement
router.get('/:studentId/fee-statement', getStudentFeeStatement);


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



module.exports = router;
