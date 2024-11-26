import React, { useState, useEffect } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Login from './pages/login';
import Dashboard from './pages/Dashboard';
import LandingPage from './pages/LandingPage';
import Students from './pages/Students'; 
import AddStudent from './pages/AddStudent';
import ConfigureGrades from './pages/ConfigureGrades';
import MainLayout from './components/MainLayout'; // Import MainLayout
import Terms from './pages/Terms';
import ManageFeeStructures from './pages/FeeStructure';
import ProcessPayment from './pages/ProcessPayments';
import PrintReceipt from './pages/PrintReceipt';
import StudentsPayments from './pages/StudentPayments';

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
                {/* Public Routes */}
                <Route path="/" element={<LandingPage />} />
                <Route 
                    path="/login" 
                    element={
                        authToken ? 
                        <Navigate to="/dashboard" replace /> : 
                        <Login setAuthToken={handleAuth} />
                    } 
                />

                {/* Protected Routes */}
                <Route
                    path="/dashboard"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <Dashboard />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/students"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <Students />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/students/add"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <AddStudent />
                            </MainLayout>
                        </ProtectedRoute>
                  }
                />
                <Route
                    path="/settings/configure-grades"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <ConfigureGrades />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/settings/terms"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <Terms />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/settings/fee-structures"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <ManageFeeStructures />
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/payments/new"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <ProcessPayment/>
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/payments/view"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <StudentsPayments/>
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/receipt/:studentId/:paymentId"
                    element={
                        <ProtectedRoute>
                                <PrintReceipt />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
};

export default App;
