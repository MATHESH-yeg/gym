const jwt = require('jsonwebtoken');

const auth = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({ error: 'Authentication required. No token provided.' });
        }

        const decoded = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
        req.user = decoded; // { id, role, brand_id, ... }
        next();
    } catch (err) {
        res.status(401).json({ error: 'Please authenticate. Invalid or expired token.' });
    }
};

const authorize = (...roles) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({
                error: `Access denied. Role ${req.user.role} is not authorized to access this resource.`
            });
        }
        next();
    };
};

module.exports = { auth, authorize };
