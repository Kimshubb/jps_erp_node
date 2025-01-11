const jwt = require('jsonwebtoken');

const authenticateToken = async (req, res, next) => {
    const authHeader = req.headers.authorization;
    console.log('Auth header:', authHeader);

    if (!authHeader) {
        console.log('No authorization header found');
        return res.status(401).json({ error: 'Unauthorized. Token required.' });
    }

    const token = authHeader.split(' ')[1];
    console.log('Extracted token:', token);

    if (!token) {
        console.log('No token found in auth header');
        return res.status(401).json({ error: 'Unauthorized. Token required.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Decoded token', decoded);

        req.user = {
            userId: decoded.userId,
            username: decoded.username,
            role: decoded.role,
            schoolId: decoded.schoolId  // This will now be an integer based on your schema
        };
        console.log("User set in request:", req.user);
        next();
    } catch (err) {
        console.error('Token verification error', err);
        res.status(401).json({ error: 'Invalid or expired token.' });
    }
};

module.exports = authenticateToken;