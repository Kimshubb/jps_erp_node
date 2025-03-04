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
import StudentsPaymentsList from './pages/StudentPayments';
import  FeeStatement from './pages/FeesStatement';
import EditStudent from './pages/EditStudent';
import ManageUsers from './pages/ManageUsers';
import AdditionalFeesPage from './pages/AdditionalFees';
import AdditionalFees from './pages/AddFee';
import ViewAddfees from './pages/ViewAddfees';
import AssignSubjects from './pages/Assignsubjects';
import FeeReportsDashboard from './pages/FeeReports';


const App = () => {
    const [authToken, setAuthToken] = useState(localStorage.getItem('token'));
    const [user,setUser] = useState(JSON.parse(localStorage.getItem('user')));
    const [isInitialized, setIsInitialized] = useState(false);

    useEffect(() => {
        const token = localStorage.getItem('token');
	const userData = localStorage.getItem('user');
        setAuthToken(token);
	setUser(userData ? JSON.parse(userData) : null);
        setIsInitialized(true);
    }, []);

    const handleAuth = (token) => {
	console.log('Setting token in auth state:', token);
        if (token) {
            localStorage.setItem('token', token);
            setAuthToken(token);
        } else {
            localStorage.removeItem('token');
	    localStorage.removeItem('user');
            setAuthToken(null);
            setUser(null);
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
                    path="/students/:studentId/edit"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <EditStudent />
                            </MainLayout>
                        </ProtectedRoute>
                    }
               />
               <Route
                    path="/students/:studentId/add-fees"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <AdditionalFees/>
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
                    path="/settings/additional-fees"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <AdditionalFeesPage />
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
                    path="/settings/users"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <ManageUsers />
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
                                <StudentsPaymentsList/>
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/payments/:studentId/fee-statement"
                    element={
                        <ProtectedRoute>
                                < FeeStatement />
                        </ProtectedRoute>
                    }
               />
                <Route
                    path="/payments/view-addfees"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <ViewAddfees/>
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/payments/fee-reports"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <FeeReportsDashboard/>
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
                <Route
                    path="/teachers/assign-subjects"
                    element={
                        <ProtectedRoute>
                            <MainLayout>
                                <AssignSubjects/>
                            </MainLayout>
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
        </Router>
    );
};

export default App;
