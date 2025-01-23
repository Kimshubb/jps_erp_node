import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Alert, IconButton, useTheme, useMediaQuery, Drawer } from '@mui/material';
import Sidebar from './Sidebar';
import Topbar from './TopBar';
import axiosInstance from '../utils/axiosInstance';

const SIDEBAR_WIDTH = 280;
const SIDEBAR_WIDTH_COLLAPSED = 64;
const MOBILE_BREAKPOINT = 'md';

const MainLayout = ({ children }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down(MOBILE_BREAKPOINT));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
    
    const [schoolName, setSchoolName] = useState('');
    const [user, setUser] = useState(null);
    const [currentTerm, setCurrentTerm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
    const [isCollapsed, setIsCollapsed] = useState(isTablet);

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (isMobile) {
                setIsSidebarOpen(false);
            } else {
                setIsSidebarOpen(true);
                setIsCollapsed(isTablet);
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

    const handleSidebarToggle = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

    const handleCollapse = () => {
        const newCollapsed = !isCollapsed;
        setIsCollapsed(newCollapsed);
        localStorage.setItem('sidebarCollapsed', newCollapsed.toString());
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

    const sidebarWidth = isCollapsed ? SIDEBAR_WIDTH_COLLAPSED : SIDEBAR_WIDTH;

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
            {/* Mobile Sidebar */}
            {isMobile ? (
                <Drawer
                    variant="temporary"
                    open={isSidebarOpen}
                    onClose={handleSidebarToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        '& .MuiDrawer-paper': {
                            width: SIDEBAR_WIDTH.expanded,
                            boxSizing: 'border-box',
                            bgcolor: 'background.paper',
                        },
                    }}
                >
                    <Sidebar
                        schoolName={schoolName}
                        isCollapsed={false}
                        onCollapse={handleCollapse}
                    />
                </Drawer>
            ) : (
                /* Desktop Sidebar */
                <Drawer
                    variant="persistent"
                    open={isSidebarOpen}
                    sx={{
                        width: sidebarWidth,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: sidebarWidth,
                            boxSizing: 'border-box',
                            position: 'fixed',
                            zIndex: theme.zIndex.drawer,
                            transition: theme.transitions.create('width', {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.enteringScreen,
                            }),
                        },
                    }}
                >
                    <Sidebar
                        schoolName={schoolName}
                        isCollapsed={isCollapsed}
                        onCollapse={handleCollapse}
                    />
                </Drawer>
            )}

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
                        marginLeft: isSidebarOpen ? `${sidebarWidth}px` : 0,
                        width: isSidebarOpen 
                            ? `calc(100% - ${sidebarWidth}px)` 
                            : '100%'
                    })
                }}
            >
                {/* Topbar with synchronized transitions */}
                <Topbar 
                    user={user}
                    currentTerm={currentTerm}
                    isCollapsed={isCollapsed}
                    onMenuClick={handleSidebarToggle}
                    showMenuIcon={!isMobile}
                    sidebarWidth={SIDEBAR_WIDTH}
                />

                {/* Content Container */}
                <Box
                    sx={{
                        flexGrow: 1,
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden',
                        position: 'relative',
                        mt: '70px', // Account for fixed AppBar height
                    }}
                >
                    <Box
                        sx={{
                            flexGrow: 1,
                            overflow: 'auto',
                            p: { xs: 2, sm: 3 },
                            maxWidth: { lg: '1440px', xl: '1600px' },
                            mx: 'auto',
                            width: '100%',
                            backgroundColor: 'background.default',
                            boxSizing: 'border-box',
                        }}
                    >
                        <Box
                            sx={{
                                minHeight: '100%',
                                borderRadius: 1,
                                backgroundColor: 'background.paper',
                                p: { xs: 2, sm: 3 },
                                boxShadow: 1
                            }}
                        >
                            {children}
                        </Box>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default MainLayout;