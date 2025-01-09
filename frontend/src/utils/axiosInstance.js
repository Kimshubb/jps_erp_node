// src/utils/axiosInstance.js
import axios from 'axios';


const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'https://api.oneclickskul.com',
    withCredentials: true,
    headers: {
        'Content-Type': 'application/json'
    },
    // Add timeout and validation
    timeout: 10000,
    validateStatus: function (status) {
        return status >= 200 && status < 500; // Handle all status codes properly
    }
});

// Update axios interceptors
axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }
        // Log the full request configuration including CORS headers
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

// Add response interceptor to log CORS headers
axiosInstance.interceptors.response.use(
    (response) => {
        console.log('Response headers:', response.headers);
        return response;
    },
    (error) => {
        if (error.response) {
            console.error('Error response headers:', error.response.headers);
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
