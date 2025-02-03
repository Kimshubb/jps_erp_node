// Description: Main controller for handling dashboard and other main routes.
// backend/src/controllers/mainController.js
const SchoolDataService = require('../utils/schoolDataService');
const prisma = require('../utils/prismaClient');


const dashboard = async (req, res) => {
    // Log user info for debugging
    console.log("Dashboard route accessed", req.user);

    // Check for valid user authentication
    if (!req.user || typeof req.user.schoolId !== 'number') {
        console.log("Invalid or missing user or schoolId in user object:", req.user);
        return res.status(401).json({ message: 'User not properly authenticated' });
    }

    // Destructure user data from request
    const { username, userId, role, schoolId } = req.user;
    console.log("Destructured User data:", { username, userId, role, schoolId });
    console.log('Request method:', req.method);
    console.log('User data from token:', req.user);
    console.log('Body data:', req.body);
    console.log('bearer token:', req.headers.authorization);

    try {
        // Initialize SchoolDataService with the authenticated user's schoolId
        const schoolDataService = new SchoolDataService(schoolId);

        // Retrieve the school details and current term to make sure dependencies are available
        const [schoolDetails, currentTerm] = await Promise.all([
            schoolDataService.getSchoolDetails(),
            schoolDataService.getCurrentTerm()
        ]);
        console.log("School details:", schoolDetails);
        console.log("Current term:", currentTerm);

        // Check if the school details or current term exist
        if (!schoolDetails) {
            console.log("No school details found for the user");
            return res.status(400).json({ message: 'School details not found. Please contact an administrator.' });
        }

        if (!currentTerm) {
            console.log("No current term found");
            
            return res.status(400).json({ 
                message: 'No current term found for this school. Please set a current term.',
                schoolName: schoolDetails.name
            });
        }

        // Fetch the dashboard data based on current term and school details
        const [
            totalActiveStudents,
            totalInactiveStudentsYear,
            totalInactiveStudentsTerm,
            totalPaidViaCashToday,
            totalBankedToday,
            recentPayments
        ] = await Promise.all([
            schoolDataService.getActiveStudents(currentTerm.id),
            schoolDataService.getInactiveStudentsYear(new Date().getFullYear()),
            schoolDataService.getInactiveStudentsTerm(currentTerm.id),
            schoolDataService.getPaidViaMethodToday('Cash'),
            schoolDataService.getPaidViaMethodToday('Bank'),
            schoolDataService.getRecentPayments(10, 0)
        ]);
        console.log("Dashboard data:", {
            totalActiveStudents,
            totalInactiveStudentsYear,
            totalInactiveStudentsTerm,
            totalPaidViaCashToday,
            totalBankedToday,
            recentPayments
        });

        // Respond with the dashboard data
        res.json({
            title: 'Dashboard',
            schoolName: schoolDetails.name,
            user: {
                userId,
                username,
                role,
                schoolId
            },
            currentTerm: {
                id: currentTerm.id,
                name: currentTerm.name
            },
            data: {
                totalActiveStudents: totalActiveStudents || 0,
                totalInactiveStudentsYear: totalInactiveStudentsYear || 0,
                totalInactiveStudentsTerm: totalInactiveStudentsTerm || 0,
                totalPaidViaCashToday: totalPaidViaCashToday || 0,
                totalBankedToday: totalBankedToday || 0,
                recentPayments: recentPayments || []
            }
        });

    } catch (error) {
        console.error('Error loading dashboard:', error);
        
        res.status(500).json({ 
            message: 'Server error while loading dashboard data',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

const getGradesAndTerms = async (req, res) => {
    try {
        const schoolId = req.user.schoolId;
        console.log('Fetching grades and terms for schoolId:', schoolId);

        const terms = await prisma.term.findMany({ 
            where: { schoolId },
            select: { 
                id: true, 
                name: true 
            },
            orderBy: { 
                startDate: 'desc' 
            }
        });

        const grades = await prisma.grade.findMany({ 
            where: { schoolId },
            select: { 
                id: true, 
                name: true 
            },
            orderBy: { 
                name: 'asc' 
            }
        });

        console.log('Found terms:', terms.length);
        console.log('Found grades:', grades.length);

        res.json({ 
            success: true, 
            terms, 
            grades 
        });
    } catch (error) {
        console.error('Error fetching grades and terms:', error);
        res.status(500).json({ 
            success: false, 
            error: 'Unable to retrieve grades and terms.',
            details: error.message 
        });
    }
};

const searchStudent = async (req, res) => {
    try {
        console.log('Searching for student:', req.query.q);
        const query = req.query.q || ''; // Search query
        const schoolId = req.user.schoolId; // Assuming user is authenticated and schoolId is attached to req.user

        if (!query) {
            return res.json([]); // Return an empty array if no query provided
        }

        // Fetch students matching the search query
        const students = await prisma.student.findMany({
            where: {
                fullName: {
                    contains: query.toLowerCase(), // Partial match
                    //mode: 'insensitive' // Case-insensitive search
                },
                schoolId: schoolId // Filter by school ID
            },
            select: {
                id: true,
                fullName: true,
                currentTerm: {
                    select: {
                        id: true,
                        current: true
                    }
                }
            }
        });
        console.log('Filtered students:', students);
        console.log('Found students:', students.length);

        // Format suggestions for response
        const suggestions = students.map(student => ({
            id: student.id,
            name: student.fullName,
            term_id: student.currentTermId?.id || null
        }));
        console.log('Suggestions:', suggestions);

        res.json(suggestions); // Send suggestions as JSON
    } catch (error) {
        console.error('Error fetching students:', error.message);
        console.log('Error fetching students:', error);
        res.status(500).json({ error: 'An error occurred while searching for students.' });
    }
};

module.exports = { dashboard, getGradesAndTerms, searchStudent}; // Export functions for use in routes
