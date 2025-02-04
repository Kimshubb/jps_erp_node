const express = require('express');
const { manageTerms, manageFeeStructure, createUser, getUsers, configureGrades, toggleUserStatus, createAdditionalFee, getAdditionalFees} = require('../controllers/settingsController');
const { body } = require('express-validator');

const router = express.Router();

//To do: missing manageAdditionalFees route

// GET and POST routes for managing terms
/*router.route('/terms')
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
    );*/


router.route('/terms').get(manageTerms).post(manageTerms);

/*GET and POST routes for managing fee structure
router.route('/fee-structure')
    .get(manageFeeStructure)
    .post(
        [
            body('term_id').isInt().withMessage('Term is required.'),
            body('grade').isInt().withMessage('Grade is required.'),
            body('tuition_fee').isFloat({ min: 0 }).withMessage('Tuition fee must be a positive number.'),
            body('diary_fee').isFloat({ min: 0 }).withMessage('Diary fee must be a positive number.'),
            body('activity_fee').isFloat({ min: 0 }).withMessage('Activity fee must be a positive number.'),
            body('others').isFloat({ min: 0 }).withMessage('Other fees must be a positive number.')

        ],
        manageFeeStructure
    );*/

router.route('/fee-structure').get(manageFeeStructure).post(manageFeeStructure);
//create user route
router.post('/new-user', createUser);
//get users route
router.get('/users', getUsers);

router.patch('/users/:id/toggle-status', toggleUserStatus);

router.get('/additional-fees', getAdditionalFees);

router.post('/additional-fees', createAdditionalFee);// Call the controller function



/** 
router.route('/fee_structure')
    .get(manageFeeStructure)
    .post(
        [
            body('term_id').isInt().withMessage('Term is required.'),
            body('grade').isInt().withMessage('Grade is required.'),
            body('tuition_fee').isFloat({ min: 0 }).withMessage('Tuition fee must be a positive number.'),
            body('ass_books').isFloat({ min: 0 }).withMessage('Assessment books fee must be a positive number.'),
            body('diary_fee').isFloat({ min: 0 }).withMessage('Diary fee must be a positive number.'),
            body('activity_fee').isFloat({ min: 0 }).withMessage('Activity fee must be a positive number.'),
            body('others').isFloat({ min: 0 }).withMessage('Other fees must be a positive number.')
        ],
        manageFeeStructure
    );

// Migrate term route
router.route('/migrate_term')
    .get(migrateTerm)
    .post(
        [body('term_id').isInt().withMessage('A valid term ID is required.')],
        migrateTerm
    );
*/
// Configure grades route
router.route('/configure-grades')
    .get(configureGrades)
    .post(
        [
            body('grades').isArray().withMessage('Grades data must be an array.'),
            body('grades.*.name').notEmpty().withMessage('Grade name is required.'),
            body('grades.*.streams').isArray().withMessage('Streams must be an array of names.')
        ],
        configureGrades
    );

module.exports = router;
