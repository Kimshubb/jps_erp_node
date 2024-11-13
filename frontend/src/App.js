// src/App.js
import React, { useState, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/login';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';

const App = () => {
    const [authToken, setAuthToken] = useState(localStorage.getItem('token'));
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
        setAuthToken(token);
        setIsInitialized(true);
    }, []);

    const handleAuth = (token) => {
        if (token) {
            localStorage.setItem('token', token);
            setAuthToken(token);
        } else {
            localStorage.removeItem('token');
            setAuthToken(null);
        }
    };

    const ProtectedRoute = ({ children }) => {
        const location = useLocation();
        
        if (!isInitialized) {
            return (
                <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                    <CircularProgress />
                </Box>
            );
        }

        if (!authToken) {
            return <Navigate to="/login" state={{ from: location }} replace />;
        }

        return children;
    };

    return (
        <Router>
            <Routes>
                <Route path="/" element={<LandingPage />} />
                <Route 
                    path="/login" 
                    element={
                        authToken ? 
                        <Navigate to="/dashboard" replace /> : 
                        <Login setAuthToken={handleAuth} />
                    } 
                />
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
};

export default App;