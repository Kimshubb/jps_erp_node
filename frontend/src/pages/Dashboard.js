import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import DashboardCards from '../components/DashboardCards';
import RecentPaymentsTable from '../components/RecentPaymentsTable'; // Import the new component
import axiosInstance from '../utils/axiosInstance';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
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
        //setDashboardData(response.data.data);
        const { schoolName, user, currentTerm, data } = response.data;

        setSchoolName(schoolName);
        setUser(user);
        setCurrentTerm(currentTerm);
        setDashboardData(data);
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
    <Box>
      {/* Render dashboard cards */}
      {dashboardData && <DashboardCards data={dashboardData} />}

      {/* Render recent payments table */}
      {dashboardData?.recentPayments && (
        <RecentPaymentsTable payments={dashboardData.recentPayments} />
      )}
    </Box>
  );
};

export default Dashboard;
