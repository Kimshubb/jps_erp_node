const express = require('express');
const { manageTerms } = require('../controllers/settingsController');
const { body } = require('express-validator');

const router = express.Router();

// GET and POST routes for managing terms
router.route('/terms')
    .get(manageTerms)
    .post(
        [
            body('name').notEmpty().withMessage('Name is required.'),
            body('year').isInt({ min: 2000, max: 2100 }).withMessage('Enter a valid year.'),
            body('startDate').isDate().withMessage('Start date is required.'),
            body('endDate').isDate().withMessage('End date is required.'),
            body('current').isBoolean().optional()
        ],
        manageTerms
    );

module.exports = router;
