<<<<<<< HEAD
import React from 'react';

import { alpha } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';
import Stack from '@mui/material/Stack';
// import Header from './components/Header';
// import MainGrid from './components/MainGrid';
import AppTheme from '../shared-theme/AppTheme';
import Copyright from '../components/Copyright';
// import dataGridCustomizations from '../shared-theme/dataGridCustomizations';


// const xThemeComponents = {
  //...dataGridCustomizations,
// };

export default function Dashboard(props) {
  return (
    <AppTheme {...props} >
      <CssBaseline enableColorScheme />
      <Box sx={{ display: 'flex' }}>
        {/* Main content */}
        <Box
          component="main"
          sx={(theme) => ({
            flexGrow: 1,
            backgroundColor: theme.vars
              ? `rgba(${theme.vars.palette.background.defaultChannel} / 1)`
              : alpha(theme.palette.background.default, 1),
            overflow: 'auto',
          })}
        >
          <Stack
            spacing={2}
            sx={{
              alignItems: 'center',
              mx: 3,
              pb: 5,
              mt: { xs: 8, md: 0 },
            }}
          >
            {/*<Header />*/}
            {/* <MainGrid /> */}
            <Copyright />
          </Stack>
        </Box>
      </Box>
    </AppTheme>
  );
}
=======
import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Alert } from '@mui/material';
import DashboardCards from '../components/DashboardCards';
import RecentPaymentsTable from '../components/RecentPaymentsTable'; // Import the new component
import axiosInstance from '../utils/axiosInstance';

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await axiosInstance.get('/api/dashboard');
        console.log('Dashboard data received:', response.data);
        setDashboardData(response.data.data); // Store only relevant dashboard data
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
>>>>>>> b2890095ee1945999db6e22a77fb718e1ea6136d
