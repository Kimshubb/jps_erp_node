// src/app.js
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');

// Route Imports
const authRoutes = require('./routes/authRoutes');
const mainRoutes = require('./routes/mainRoutes');
//const studentRoutes = require('./routes/studentRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
//const paymentRoutes = require('./routes/paymentRoutes');
const imageRoutes = require('./routes/imageRoutes');
const resourceRoutes = require('./routes/resourceRoutes');
const blogRoutes = require('./routes/blogRoutes');

// Middleware Imports
const isAuthenticated = require('./middleware/authMiddleware');
//const { errorHandler } = require('./middleware/errorHandler');

const app = express();

// Middleware Configuration
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Log requests for debugging
app.use((req, res, next) => {
    console.log(`Request Method: ${req.method}, Request URL: ${req.url}`);
    next();
});

// Serve static files from React build
//app.use(express.static(path.join(__dirname, '../frontend/build')));

// Serve static files
app.use('/images', express.static(path.join(__dirname, 'public/uploads')));
app.use('/resources', express.static(path.join(__dirname, 'resources')));


// API Routes
app.use('/api/auth', authRoutes);
app.use('/api', isAuthenticated, mainRoutes); // Protected main routes
//app.use('/api', isAuthenticated, studentRoutes); // Protected student routes
app.use('/api/settings', isAuthenticated, settingsRoutes); // Protected settings routes
//app.use('/api/payments', isAuthenticated, paymentRoutes); // Protected payment routes
app.use('/api/images', imageRoutes);
app.use('/api/resources', resourceRoutes);
app.use('/api/blog', blogRoutes)



// API Documentation route
app.get('/api', (req, res) => {
    res.json({
        message: 'OneClickSmis API',
        version: '1.0.0',
        endpoints: {
            auth: '/api/auth/*',
            dashboard: '/api/dashboard',
           // students: '/api/students/*',
            settings: '/api/settings/*',
            //payments: '/api/payments/*'

        }
    });
});


//app.use(errorHandler);

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
});

// Serve React frontend for all other routes
//app.get('*', (req, res) => {
   // res.sendFile(path.join(__dirname, '../frontend/build', 'index.html'));
//});

// Server Configuration
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});

module.exports = app; // Export for testing purposes