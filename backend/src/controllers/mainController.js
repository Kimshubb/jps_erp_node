const SchoolDataService = require('../utils/SchoolDataService');

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
            schoolDataService.getRecentPayments(10)
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

module.exports = { dashboard };
