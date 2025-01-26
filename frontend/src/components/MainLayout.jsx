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
const LARGE_SCREEN_BREAKPOINT = 'lg';
const EXTRA_LARGE_SCREEN_BREAKPOINT = 'xl';

const MainLayout = ({ children }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down(MOBILE_BREAKPOINT));
    const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'lg'));
    const isLargeScreen = useMediaQuery(theme.breakpoints.up(LARGE_SCREEN_BREAKPOINT));
    const isExtraLargeScreen = useMediaQuery(theme.breakpoints.up(EXTRA_LARGE_SCREEN_BREAKPOINT));

    const [schoolName, setSchoolName] = useState('');
    const [user, setUser] = useState(null);
    const [currentTerm, setCurrentTerm] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [isSidebarOpen, setIsSidebarOpen] = useState(!isMobile);
    const [isMiniVariant, setIsMiniVariant] = useState(
        localStorage.getItem('sidebarMiniVariant') === 'true' || isTablet
    );

    // Handle window resize
    useEffect(() => {
        const handleResize = () => {
            if (isMobile) {
                setIsSidebarOpen(false);
                setIsMiniVariant(false); // Always expanded on mobile
            } else {
                setIsSidebarOpen(true);
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

    const handleSidebarToggle = () => {
        setIsSidebarOpen(!isSidebarOpen);
    };

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

    const sidebarWidth = isMiniVariant ? SIDEBAR_MINI_WIDTH : SIDEBAR_WIDTH;

    return (
        <Box sx={{ display: 'flex', minHeight: '100vh', ...(isExtraLargeScreen ? {
            maxWidth: '1920px',
            margin: '0 auto'
        } : {})
         }}>
            {/* Mobile Sidebar */}
            {isMobile ? (
                <Drawer
                    variant="temporary"
                    open={isSidebarOpen}
                    onClose={handleSidebarToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        '& .MuiDrawer-paper': {
                            width: SIDEBAR_WIDTH,
                            boxSizing: 'border-box',
                            bgcolor: 'background.paper',
                        },
                    }}
                >
                    <Sidebar
                        schoolName={schoolName}
                        isMiniVariant={false} // Always expanded on mobile
                        onMiniVariantToggle={handleMiniVariantToggle}
                    />
                </Drawer>
            ) : (
                /* Desktop/Tab Sidebar */
                <Drawer
                    variant="persistent"
                    open={isSidebarOpen}
                    sx={{
                        width: sidebarWidth,
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: sidebarWidth,
                            boxSizing: 'border-box',
                            overflowX: 'hidden', // Prevent horizontal scroll
                            transition: theme.transitions.create('width', {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.enteringScreen,
                            }),
                            borderRight: 'none', // Remove border for seamless integration
                            boxShadow: isMiniVariant ? 'none' : theme.shadows[4], // Elevation for expanded state
                        },
                    }}
                >
                    <Sidebar
                        schoolName={schoolName}
                        isMiniVariant={isMiniVariant}
                        onMiniVariantToggle={handleMiniVariantToggle}
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
                    ...(isLargeScreen ? {
                        marginLeft: isSidebarOpen ? `${sidebarWidth}px` : 0,
                        width: isSidebarOpen 
                            ? `calc(100% - ${sidebarWidth}px)` 
                            : '100%'
                    } : {})
                }}
            >
                {/* Topbar */}
                <Topbar 
                    user={user}
                    currentTerm={currentTerm}
                    isMiniVariant={isMiniVariant}
                    onMenuClick={handleSidebarToggle}
                    showMenuIcon={isMobile}
                    sidebarWidth={{
                        expanded: SIDEBAR_WIDTH,
                        collapsed: SIDEBAR_MINI_WIDTH
                    }}
                    sx={{ 
                        height: TOPBAR_HEIGHT, 
                        pl: isMobile ? 2 : 3,
                        ...(isLargeScreen && {
                            width: isSidebarOpen 
                                ? `calc(100% - ${sidebarWidth}px)` 
                                : '100%',
                            ml: isSidebarOpen ? `${sidebarWidth}px` : 0
                        })
                    }}
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
                            px: {
                                xs: 2,
                                sm: 3,
                                lg: isMiniVariant ? 2 : 3,
                                xl: isMiniVariant ? 2 : 3
                            },
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