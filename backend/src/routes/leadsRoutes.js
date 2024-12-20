// src/routes/leadRoutes.js

const express = require('express');
const router = express.Router();
const leadController = require('../controllers/leadController');
const captureRateLimiter = require('../middleware/ratelimiterMiddleware');
//const { protect, restrictTo } = require('../middleware/authMiddleware');

// Public route for capturing leads
router.post('/capture', captureRateLimiter, leadController.captureLead);

// Protected routes for admin
//router.use(protect);
//router.use(restrictTo('admin'));

//router.get('/', leadController.getLeads);
//router.patch('/:id/status', leadController.updateLeadStatus);

module.exports = router;