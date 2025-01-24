import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Alert, useTheme, useMediaQuery, Drawer } from '@mui/material';
import Sidebar from './Sidebar';
import Topbar from './TopBar';
import axiosInstance from '../utils/axiosInstance';

// Constants
const SIDEBAR_WIDTH = 280;
const SIDEBAR_MINI_WIDTH = 64;
const MOBILE_BREAKPOINT = 'md';
const TOPBAR_HEIGHT = 70;

const MainLayout = ({ children }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down(MOBILE_BREAKPOINT));
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));

  const [schoolName, setSchoolName] = useState('');
  const [user, setUser] = useState(null);
  const [currentTerm, setCurrentTerm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isMiniVariant, setIsMiniVariant] = useState(
    localStorage.getItem('sidebarMiniVariant') === 'true' || isTablet
  );

  // Handle window resize
  useEffect(() => {
    const handleResize = () => {
      if (isMobile) {
        setIsMiniVariant(false); // Always expanded on mobile
      } else {
        setIsMiniVariant(isTablet); // Mini variant on tablet, expanded on desktop
      }
    };

    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [isMobile, isTablet]);

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await axiosInstance.get('/api/dashboard');
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

  const handleMiniVariantToggle = () => {
    const newMiniVariant = !isMiniVariant;
    setIsMiniVariant(newMiniVariant);
    localStorage.setItem('sidebarMiniVariant', newMiniVariant.toString());
  };

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
    <Box sx={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <Sidebar
        schoolName={schoolName}
        isMiniVariant={isMiniVariant}
        onMiniVariantToggle={handleMiniVariantToggle}
      />

      {/* Main Content Area */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          width: '100%',
          transition: theme.transitions.create(['margin', 'width'], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          ...(isMobile ? {} : {
            marginLeft: isMiniVariant ? `${SIDEBAR_MINI_WIDTH}px` : `${SIDEBAR_WIDTH}px`,
            width: isMiniVariant 
              ? `calc(100% - ${SIDEBAR_MINI_WIDTH}px)` 
              : `calc(100% - ${SIDEBAR_WIDTH}px)`,
          }),
        }}
      >
        {/* Topbar */}
        <Topbar
          user={user}
          currentTerm={currentTerm}
          isMiniVariant={isMiniVariant}
          onMenuClick={handleMiniVariantToggle}
          showMenuIcon={!isMobile} // Show toggle button on all devices except mobile
          sidebarWidth={{ expanded: SIDEBAR_WIDTH, collapsed: SIDEBAR_MINI_WIDTH }}
        />

        {/* Content Container */}
        <Box
          sx={{
            flexGrow: 1,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'hidden',
            position: 'relative',
            mt: `${TOPBAR_HEIGHT}px`,
            p: { xs: 2, sm: 3 }, // Add padding to the main content
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;