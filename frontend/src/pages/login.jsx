// src/pages/login.js
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
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
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError(null);

        try {
            //clear existing tokens
            localStorage.removeItem('token');
            localStorage.removeItem('user');

            const response = await axiosInstance.post('/api/auth/login', {
                username,
                password
            });
            console.log(response.data.token);

            if (response.data.token) {
                localStorage.setItem('token', response.data.token);
                localStorage.setItem('user', JSON.stringify(response.data.user));
                //update auth state
                setAuthToken(token);

                console.log('Token received and stored:', token);
                console.log('stored user:', user);

                navigate('/dashboard');
            } else {
                throw new Error('No token received');
            }
        } catch (error) {
            console.error('Login error details:', error);
            setError(error.response?.data?.message || 'Login failed');
            //clear any stored incomplete data
            localStorage.removeItem('token');
            localStorage.removeItem('user');

        } finally {
            setLoading(false);
        }
    };

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
                    <Alert severity="error" sx={{ width: '100%', mt: 2 }}>
                        {error}
                    </Alert>
                )}

                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1 }}>
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
                    />
                    <Button
                        type="submit"
                        fullWidth
                        variant="contained"
                        sx={{ mt: 3, mb: 2 }}
                        disabled={loading}
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
