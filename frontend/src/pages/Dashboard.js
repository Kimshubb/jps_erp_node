// src/pages/Dashboard.js
import React, { useEffect, useState } from 'react';
import { Box, Container, CircularProgress, Alert } from '@mui/material';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/TopBar';
import DashboardCards from '../components/DashboardCards';
import axiosInstance from '../utils/axiosInstance';

const Dashboard = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axiosInstance.get('/api/dashboard');
        console.log('Dashboard data received:', response.data);
        setData(response.data); // Store all data in state
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

    fetchData();
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

  // Destructure school details and user from the fetched data
  const { schoolName, user } = data;

  return (
    <Box display="flex">
      {/* Pass user and schoolDetails as props to Sidebar */}
      <Sidebar schoolName={schoolName} />
      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default', p: 3 }}>
        <Topbar user={user}/>
        <Container>
          {data && <DashboardCards data={data} />}
        </Container>
      </Box>
    </Box>
  );
};

export default Dashboard;
