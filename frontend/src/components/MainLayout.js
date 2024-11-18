import React from 'react';
import { Box, Container } from '@mui/material';
import Sidebar from '../components/Sidebar';
import Topbar from '../components/TopBar';

const MainLayout = ({ children }) => {
    return (
        <Box display="flex">
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <Box
                component="main"
                sx={{
                    flexGrow: 1,
                    bgcolor: 'background.default',
                    p: 6, // General padding around content
                }}
            >
                {/* Topbar */}
                <Topbar />

                {/* Add spacing between Topbar and content */}
                <Box sx={{ mt: 3 }}>{/* Add vertical margin */}
                    <Container>{children}</Container>
                </Box>
            </Box>
        </Box>
    );
};

export default MainLayout;
