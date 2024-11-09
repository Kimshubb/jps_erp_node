// src/controllers/mainController.js
const SchoolDataService = require('../utils/SchoolDataService');

const dashboard = async (req, res) => {
    const { username, schoolName, schoolId } = req.user;

    try {
        // Instantiate the SchoolDataService class with the schoolId
        const schoolDataService = new SchoolDataService(schoolId);

        // Fetch data
        const currentTerm = await schoolDataService.getCurrentTerm();
        const totalActiveStudents = await schoolDataService.getActiveStudents(currentTerm.id);
        const totalInactiveStudentsYear = await schoolDataService.getInactiveStudentsYear(new Date().getFullYear());
        const totalInactiveStudentsTerm = await schoolDataService.getInactiveStudentsTerm(currentTerm.id);
        const totalPaidViaCashToday = await schoolDataService.getPaidViaMethodToday('Cash');
        const totalBankedToday = await schoolDataService.getPaidViaMethodToday('Bank');
        const recentPayments = await schoolDataService.getRecentPayments(10);

        // Log the values to ensure they are defined
        console.log("totalActiveStudents:", totalActiveStudents);
        console.log("totalInactiveStudentsYear:", totalInactiveStudentsYear);
        console.log("totalInactiveStudentsTerm:", totalInactiveStudentsTerm);
        console.log("totalPaidViaCashToday:", totalPaidViaCashToday);
        console.log("totalBankedToday:", totalBankedToday);
        console.log("recentPayments:", recentPayments);


        // Render `dashboard.ejs` directly and pass all the required data
        res.render('dashboard', {
            title: 'Dashboard',
            schoolName,
            user: req.user,
            totalActiveStudents,
            totalInactiveStudentsYear,
            totalInactiveStudentsTerm,
            totalPaidViaCashToday,
            totalBankedToday,
            recentPayments
        });

    } catch (error) {
        console.error('Error loading dashboard:', error);
        res.render('layout', {
            title: 'Dashboard',
            schoolName,
            user: req.user,
            content: '<p>Error loading dashboard.</p>'
        });
    }
};
