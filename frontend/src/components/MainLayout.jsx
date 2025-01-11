import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Alert, IconButton, useTheme, useMediaQuery, Drawer } from '@mui/material';
//import MenuIcon from '@mui/icons-material/Menu';
//import CloseIcon from '@mui/icons-material/Close';
import Sidebar from './Sidebar';
import Topbar from './TopBar';
import axiosInstance from '../utils/axiosInstance';

// Breakpoint constants
const SIDEBAR_WIDTH = 280;
const SIDEBAR_WIDTH_COLLAPSED = 64;
//const MOBILE_BREAKPOINT = 'md'; // Material-UI's medium breakpoint (960px)

const MainLayout = ({ children }) => {
    const theme = useTheme();
    const isMobile = useMediaQuery(theme.breakpoints.down('md'));
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
                            width: SIDEBAR_WIDTH,
                            boxSizing: 'border-box',
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
                <Box
                    component="nav"
                    sx={{
                        width: sidebarWidth,
                        flexShrink: 0,
                        transition: theme.transitions.create('width', {
                            easing: theme.transitions.easing.sharp,
                            duration: theme.transitions.duration.enteringScreen,
                        }),
                    }}
                >
                    <Drawer
                        variant="permanent"
                        sx={{
                            '& .MuiDrawer-paper': {
                                width: sidebarWidth,
                                boxSizing: 'border-box',
                                transition: theme.transitions.create('width', {
                                    easing: theme.transitions.easing.sharp,
                                    duration: theme.transitions.duration.enteringScreen,
                                }),
                            },
                        }}
                        open
                    >
                        <Sidebar
                            schoolName={schoolName}
                            isCollapsed={isCollapsed}
                            onCollapse={handleCollapse}
                        />
                    </Drawer>
                </Box>
            )}

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    minHeight: '100vh',
                    display: 'flex',
                    flexDirection: 'column',
                    width: { 
                        xs: '100%',
                        md: `calc(100% - ${sidebarWidth}px)` 
                    },
                    ml: { 
                        xs: 0,
                        md: `${sidebarWidth}px` 
                    },
                    transition: theme.transitions.create(['margin', 'width'], {
                        easing: theme.transitions.easing.sharp,
                        duration: theme.transitions.duration.enteringScreen,
                    }),
                }}
            >
                <Topbar 
                    user={user}
                    currentTerm={currentTerm}
                    onMenuClick={handleSidebarToggle}
                    showMenuIcon={isMobile}
                />
                
                <Box
                    sx={{
                        flexGrow: 1,
                        p: {
                            xs: 2,
                            sm: 3,
                            md: 4
                        },
                        overflow: 'auto',
                        backgroundColor: 'background.default'
                    }}
                >
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default MainLayout;