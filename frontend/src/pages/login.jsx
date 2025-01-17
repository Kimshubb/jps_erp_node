// src/pages/login.js
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import axiosInstance from '../utils/axiosInstance';
import { 
    Box, 
    Button, 
    TextField, 
    Typography, 
    Container,
    CircularProgress,
    Alert
} from '@mui/material';

const Login = ({ setAuthToken }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    // Handle any returnUrl or error messages from redirects
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const errorMessage = params.get('error');
        
        if (errorMessage === 'session_expired') {
            setError('Your session has expired. Please log in again.');
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            // Clear existing auth data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setAuthToken(null);

            const response = await axiosInstance.post('/api/auth/login', {
                username,
                password
            });

            if (response.data.token) {
                // Store auth data
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                setAuthToken(response.data.token);

                // Handle redirect
                const params = new URLSearchParams(location.search);
                const returnUrl = params.get('returnUrl');
                
                // If there's a return URL and it's not the login page itself
                if (returnUrl && !returnUrl.includes('/login')) {
                    navigate(returnUrl);
                } else {
                    navigate('/dashboard');
                }
            } else {
                throw new Error('No token received');
            }
        } catch (error) {
            console.error('Login error:', error);
            
            // Enhanced error handling
            if (error.response?.data?.code === 'USER_NOT_FOUND') {
                setError('The username does not exist! Please register first.');
            } else if (error.response?.code === 'INVALID_PASSWORD') {
                setError('Invalid username or password');
            } else if (error.response?.status === 429) {
                setError('Too many login attempts. Please try again later.');
            } else {
                setError('Login failed. Please try again.');
            }

            // Clear any incomplete auth data
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setAuthToken(null);
        } finally {
            setLoading(false);
        }
    };

    // Prevent form submission while loading
    const isSubmitDisabled = loading || !username.trim() || !password.trim();

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    marginTop: 8,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                }}
            >
                <Typography component="h1" variant="h5">
                    Sign in
                </Typography>

                {error && (
                    <Alert 
                        severity="error" 
                        sx={{ width: '100%', mt: 2 }}
                        onClose={() => setError(null)}
                    >
                        {error}
                    </Alert>
                )}

                <Box 
                    component="form" 
                    onSubmit={handleSubmit} 
                    sx={{ mt: 1 }}
                    noValidate
                >
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        id="username"
                        label="Username"
                        name="username"
                        autoComplete="username"
                        autoFocus
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        disabled={loading}
                        error={!!error}
                        inputProps={{
                            maxLength: 50
                        }}
                    />
                    <TextField
                        margin="normal"
                        required
                        fullWidth
                        name="password"
                        label="Password"
                        type="password"
                        id="password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={loading}
                        error={!!error}
                        inputProps={{
                            maxLength: 100
                        }}
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={isSubmitDisabled}
                    >
                        {loading ? (
                            <CircularProgress size={24} color="inherit" />
                        ) : (
                            'Sign In'
                        )}
                    </Button>
                </Box>
            </Box>
        </Container>
    );
};

export default Login;