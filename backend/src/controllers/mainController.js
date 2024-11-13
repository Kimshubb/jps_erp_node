// src/controllers/mainController.js
const SchoolDataService = require('../utils/SchoolDataService');

const dashboard = async (req, res) => {
    console.log("dashboard - req.user:", req.user);
    
    // Updated check to match the authentication middleware structure
    if (!req.user || typeof req.user.schoolId !== 'number') {
        console.log("Invalid or missing schoolId in user object:", req.user);
        return res.status(401).json({ message: 'User not properly authenticated' });
    }

    // Destructure all relevant user info
    const { username, userId, role, schoolId } = req.user;

    try {
        // Initialize SchoolDataService with the schoolId from authenticated user
        const schoolDataService = new SchoolDataService(schoolId);

        // Fetch all required data
        const [
            currentTerm,
            schoolDetails,
            totalActiveStudents,
            totalInactiveStudentsYear,
            totalInactiveStudentsTerm,
            totalPaidViaCashToday,
            totalBankedToday,
            recentPayments
        ] = await Promise.all([
            schoolDataService.getCurrentTerm(),
            schoolDataService.getSchoolDetails(),
            schoolDataService.getActiveStudents(currentTerm?.id), // Use optional chaining
            schoolDataService.getInactiveStudentsYear(new Date().getFullYear()),
            schoolDataService.getInactiveStudentsTerm(currentTerm?.id),
            schoolDataService.getPaidViaMethodToday('Cash'),
            schoolDataService.getPaidViaMethodToday('Bank'),
            schoolDataService.getRecentPayments(10)
        ]);

        // Check if current term exists
        if (!currentTerm) {
            return res.status(400).json({ 
                message: 'No current term found for this school.',
                schoolId,
                schoolName: schoolDetails?.name 
            });
        }

        // Return dashboard data
        res.json({
            title: 'Dashboard',
            schoolName: schoolDetails?.name,
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
                totalActiveStudents,
                totalInactiveStudentsYear,
                totalInactiveStudentsTerm,
                totalPaidViaCashToday,
                totalBankedToday,
                recentPayments
            }
        });

    } catch (error) {
        console.error('Error loading dashboard:', error);
        
        // More detailed error response
        res.status(500).json({ 
            message: 'Server error while loading dashboard',
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
};

module.exports = { dashboard };