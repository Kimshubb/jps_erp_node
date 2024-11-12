// server.js
const express = require('express');
const cors = require('cors');
const paymentRoutes = require('./src/routes/paymentRoutes');
const { authenticateUser } = require('./src/middleware/authMiddleware'); // Ensure user authentication
const { dashboard } = require('./src/controllers/mainController');
const { login } = require('./src/controllers/authController');

const app = express();
app.use(cors()); // Enable CORS for frontend-backend communication
app.use(express.json()); // Parse JSON request bodies

// Add the authentication middleware globally if required
app.use(authenticateUser);

// Landing page route
app.get('/', (req, res) => {
    res.send('Welcome to the payment API.');
});

//login page route
app.get('/login', login);

//dashboard page route
app.get('/dashboard', dashboard);


// Payment routes
app.use('/api/payments', paymentRoutes);

// Student routes
app.use('/api/students', studentRoutes);

// Mount settings routes
app.use('/settings', settingsRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
// In the code snippet above, we have defined a basic Express server that listens on port 5000 (or a port specified in the environment variable PORT). We have also added CORS support and JSON body parsing middleware. The authenticateUser middleware is used to ensure that all routes under /api/payments are protected and require user authentication.