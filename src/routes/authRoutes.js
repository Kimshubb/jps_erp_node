// src/routes/authRoutes.js
const express = require('express');
const { login, createUser } = require('../controllers/authController');
const isAuthenticated = require('../middleware/authMiddleware');
const isAdmin = require('../middleware/roleMiddleware');
const router = express.Router();


// Route for logging in a user
router.post('/login', login);

// Create user route (admin only)
router.post('/create_user', isAuthenticated, isAdmin, createUser);

module.exports = router;