const jwt = require('jsonwebtoken');

const authenticateToken = async (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
        return res.status(401).json({ error: 'Unauthorized. Token required.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = {
            userId: decoded.userId,
            username: decoded.username,
            role: decoded.role,
            schoolId: decoded.schoolId  // This will now be an integer based on your schema
        };
        console.log("authenticateToken - req.user:", req.user);
        next();
    } catch (err) {
        res.status(401).json({ error: 'Invalid or expired token.' });
    }
};

module.exports = authenticateToken;