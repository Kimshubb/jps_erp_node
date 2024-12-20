const express = require('express');
const { getAllSubjects, assignTeacherSubjects, getSubjectAllocationData, removeTeacherSubjectAssignment } = require ('../controllers/teachersController.js');

const router = express.Router();

// GET: Fetch all subjects grouped by grade for the teacher's school
router.get('/subjects', getAllSubjects);

// POST: Assign subjects and streams to a teacher
router.post('/assign-subjects', assignTeacherSubjects);

// GET: Fetch subject allocation data for the school
router.get('/subject-allocation', getSubjectAllocationData);

router.post('/remove-subject-assignment', removeTeacherSubjectAssignment)

module.exports = router;