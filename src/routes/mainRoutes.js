const express = require('express');
const { dashboard } = require('../controllers/mainController');
const isAuthenticated = require('../middleware/authMiddleware'); // Middleware for checking if user is authenticated

const router = express.Router();

// Dashboard route (protected)
router.get('/dashboard', isAuthenticated, dashboard);

module.exports = router;