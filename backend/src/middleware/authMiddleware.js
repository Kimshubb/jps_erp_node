const jwt = require('jsonwebtoken');

const isAuthenticated = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1]; // Get the token from "Bearer <token>"

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized. Token required.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded; // Attach decoded user info to request
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid or expired token.' });
    }
};

module.exports = isAuthenticated;