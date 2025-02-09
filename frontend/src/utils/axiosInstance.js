import axios from 'axios';
import { jwtDecode } from 'jwt-decode'; // Add this package

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'https://api.oneclickskul.com',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    },
    timeout: 10000,
    validateStatus: function (status) {
        return status >= 200 && status < 500;
    }
});

// Function to check if token is expired
const isTokenExpired = (token) => {
    if (!token) return true;
    
    try {
        const decoded = jwtDecode(token);
        // Add 60 seconds buffer to handle time differences
        const currentTime = Date.now() / 1000;
        return decoded.exp < currentTime + 60;
    } catch (error) {
        console.error('Token decode error:', error);
        return true;
    }
};

// Function to handle auth redirect
const handleAuthRedirect = () => {
    // Clear auth data
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Get current location and state
    const currentPath = window.location.pathname;
    const currentSearch = window.location.search;
    const fullPath = currentPath + currentSearch;
    
    // Don't redirect if already on login page
    if (currentPath === '/login') {
        return;
    }

    // Construct redirect URL with return path
    const redirectUrl = `/login?returnUrl=${encodeURIComponent(fullPath)}&error=session_expired`;
    
    // Use replace to prevent back button from returning to expired session
    window.location.replace(redirectUrl);
};

// Request interceptor
axiosInstance.interceptors.request.use(
    async (config) => {
        const token = localStorage.getItem('token');
        console.log('Token:', token);
        
        // Check token expiration before making request
        if (token && isTokenExpired(token)) {
            console.log('Token expired. Redirecting to login page.');
            handleAuthRedirect();
            return Promise.reject(new axios.Cancel('Token expired'));
        }
        
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Token added to headers:', config.headers);
        }
        
        console.log('Request config:', {
            url: config.url,
            method: config.method,
            headers: config.headers,
            withCredentials: config.withCredentials
        });
        
        return config;
    },
    (error) => {
        console.error('Request error:', error);
        return Promise.reject(error);
    }
);

// Response interceptor
axiosInstance.interceptors.response.use(
    (response) => {
        console.log('Response headers:', response.headers);
        return response;
    },
    (error) => {
        console.log('Error response:', error.response);
        
        // Handle different error scenarios
        if (error.response) {
            const { status, data } = error.response;
            
            switch (status) {
                case 401: // Unauthorized
                    // Check if the error is due to token expiration
                    if (data?.message?.toLowerCase().includes('expired') ||
                        data?.error?.toLowerCase().includes('expired')) {
                        handleAuthRedirect();
                    }
                    break;
                    
                case 403: // Forbidden
                    // Handle forbidden access (optional)
                    console.error('Forbidden access:', data);
                    break;
                    
                default:
                    console.error('API Error:', data);
            }
            
            console.error('Error response headers:', error.response.headers);
        } else if (error.request) {
            // Request was made but no response received
            console.error('No response received:', error.request);
        } else {
            // Error in request configuration
            console.error('Request error:', error.message);
        }
        
        return Promise.reject(error);
    }
);

export default axiosInstance;