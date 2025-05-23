const db = require('../db/database');
const logger = require('../utils/logger');
const jwt = require('jsonwebtoken');

/**
 * Middleware для получения информации о текущем пользователе
 * с использованием JWT-токена
 */
module.exports = async (req, res, next) => {
    try {
        const token = req.cookies.token || req.headers.authorization?.split(' ')[1];

        if (!token) {
            req.user = null;
            return next();
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        if (!decoded.userid) {
            req.user = null;
            return next();
        }

        const user = await db('users')
            .where('userid', decoded.userid)
            .first();

        if (!user) {
            req.user = null;
            return next();
        }

        req.user = {
            userid: user.userid,
            username: user.username,
            email: user.email,
            role: user.role
        };
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            req.user = null;
            return next();
        }
        logger.error('Authentication error:', error);
    }

    next();
}; 