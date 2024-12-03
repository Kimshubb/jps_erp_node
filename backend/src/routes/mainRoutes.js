// src/routes/mainRoutes.js
const express = require('express');
const { dashboard, getGradesAndTerms, searchStudent} = require('../controllers/mainController');
const authenticateToken  = require('../middleware/authMiddleware'); // Middleware for checking if user is authenticated
console.log("Dashboard function:", dashboard);
const router = express.Router();

/**Dashboard route (protected)
router.get('/dashboard', authenticateToken, async (req, res) => {
    console.log("Dashboard route accessed", req.user);
    try {
      const data = await dashboard();
      res.json(data);
    } catch (error) {
      console.log("Error:", error.message);
      res.status(500).json({ message: error.message });
    }
  });*/

// Dashboard route (protected)

router.get('/dashboard', authenticateToken, dashboard);

router.get('/grades-and-terms', authenticateToken, getGradesAndTerms);

router.get('/search-student', authenticateToken, searchStudent);





module.exports = router;