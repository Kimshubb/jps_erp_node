import React, { useEffect, useState } from 'react';
import { Box, CircularProgress, Alert, IconButton, useTheme, useMediaQuery, Drawer } from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/TopBar';
import axiosInstance from '../utils/axiosInstance';

// Breakpoint constants
const SIDEBAR_WIDTH = 240;
const SIDEBAR_WIDTH_COLLAPSED = 64;
const MOBILE_BREAKPOINT = 'md'; // Material-UI's medium breakpoint (960px)

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

    const [isCollapsed, setIsCollapsed] = useState(() => {
        return localStorage.getItem('sidebarCollapsed') === 'true';
    });

    // Handle window resize
    useEffect(() => {
        setIsSidebarOpen(!isMobile);
        setIsCollapsed(isTablet);
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
        setIsCollapsed(!isCollapsed);
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

    // Calculate sidebar width based on state
    const getCurrentSidebarWidth = () => {
        if (isMobile) return 0;
        if (isCollapsed) return SIDEBAR_WIDTH_COLLAPSED;
        return SIDEBAR_WIDTH;
    };

    const sidebarContent = (
        <Sidebar 
            schoolName={schoolName}
            isCollapsed={isCollapsed}
            onCollapse={handleCollapse}
        />
    );

    return (
        <Box sx={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
            {/* Mobile Drawer */}
            {isMobile && (
                <Drawer
                    variant="temporary"
                    open={isSidebarOpen}
                    onClose={handleSidebarToggle}
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', [MOBILE_BREAKPOINT]: 'none' },
                        '& .MuiDrawer-paper': { 
                            width: SIDEBAR_WIDTH,
                            boxSizing: 'border-box',
                        },
                    }}
                >
                    {sidebarContent}
                </Drawer>
            )}

            {/* Desktop Sidebar */}
            {!isMobile && (
                <Box
                    sx={{
                        width: getCurrentSidebarWidth(),
                        flexShrink: 0,
                        '& .MuiDrawer-paper': {
                            width: getCurrentSidebarWidth(),
                            boxSizing: 'border-box',
                            transition: theme.transitions.create('width', {
                                easing: theme.transitions.easing.sharp,
                                duration: theme.transitions.duration.enteringScreen,
                            }),
                        },
                    }}
                >
                    <Drawer
                        variant="permanent"
                        sx={{
                            width: getCurrentSidebarWidth(),
                            flexShrink: 0,
                        }}
                    >
                        {sidebarContent}
                    </Drawer>
                </Box>
            )}

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    width: { 
                        [MOBILE_BREAKPOINT]: `calc(100% - ${getCurrentSidebarWidth()}px)` 
                    },
                    height: '100vh',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                }}
            >
                {/* Topbar */}
                <Box sx={{ 
                    position: 'sticky', 
                    top: 0, 
                    zIndex: theme.zIndex.appBar,
                    bgcolor: 'background.default',
                    boxShadow: 1,
                }}>
                    <Topbar 
                        user={user} 
                        currentTerm={currentTerm}
                        onMenuClick={handleSidebarToggle}
                        showMenuIcon={isMobile}
                    />
                </Box>

                {/* Scrollable Content Area */}
                <Box sx={{
                    flexGrow: 1,
                    overflow: 'auto',
                    p: {
                        xs: 2,  // Smaller padding on mobile
                        sm: 3,  // Medium padding on tablet
                        md: 6,  // Large padding on desktop
                    },
                    bgcolor: 'background.default',
                }}>
                    {children}
                </Box>
            </Box>
        </Box>
    );
};

export default MainLayout;