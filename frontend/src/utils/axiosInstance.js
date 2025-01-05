// src/utils/axiosInstance.js
import axios from 'axios';

const axiosInstance = axios.create({
    baseURL: process.env.REACT_APP_API_URL || 'https://api.oneclickskul.com',
    timeout: 5000,
    headers: {
        'Content-Type': 'application/json',
        Accept: 'application/json',
    },
});

axiosInstance.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token');
        console.log('Token being attached', token);
        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
            console.log('Headers after token attachment', config.headers);
        }
        return config;
    },
    (error) => {
        console.error('Request intercepter error', error)
        return Promise.reject(error)
    }
);

axiosInstance.interceptors.response.use(
    (response) => response,
    (error) => {
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login';
        }
        return Promise.reject(error);
    }
);

export default axiosInstance;
