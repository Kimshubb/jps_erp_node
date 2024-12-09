import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/TopBar';
import axiosInstance from '../utils/axiosInstance';

const MainLayout = ({ children }) => {
    const [schoolName, setSchoolName] = useState('');
    const [user, setUser] = useState(null);
    const [currentTerm, setCurrentTerm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchDashboardData = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await axiosInstance.get('/api/dashboard');
                console.log('Dashboard data received:', response.data);

                const { schoolName, user, currentTerm } = response.data;

                setSchoolName(schoolName);
                setUser(user);
                setCurrentTerm(currentTerm);
            } catch (error) {
                console.error('Error fetching dashboard data:', error);
                setError(error.response?.data?.message || 'Failed to load dashboard data');
                if (error.response?.status === 401) {
                    localStorage.removeItem('token');
                    window.location.href = '/login';
                }
            } finally {
                setLoading(false);
            }
        };

        fetchDashboardData();
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    if (error) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <Alert severity="error">{error}</Alert>
            </Box>
        );
    }

    return (
        <Box display="flex">
            {/* Pass fetched data to Sidebar */}
            <Sidebar schoolName={schoolName} />

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    bgcolor: 'background.default',
                    p: 6,
                }}
            >
                <Topbar user={user} currentTerm={currentTerm}/>
                <Box sx={{ mt: 3 }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default MainLayout;