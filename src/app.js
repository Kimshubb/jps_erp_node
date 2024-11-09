// src/app.js
require('dotenv').config();
const express = require('express');
const authRoutes = require('./routes/authRoutes');
const path = require('path');

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set EJS as the view engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Middleware to serve static files
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.use('/auth', authRoutes);

// Landing page route
app.get('/', (req, res) => {
    res.render('index');
});

//login page route
app.get('/login', (req, res) => {
    res.render('login', { messages: [] });
});

//dashboard page route
app.get('/dashboard', (req, res) => {
    res.render('dashboard');
});

// 404 route


const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
    console.log(`http://localhost:${PORT}`);
});
