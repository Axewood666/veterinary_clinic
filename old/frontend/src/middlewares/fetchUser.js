const axios = require('axios');

/**
 * Middleware для получения информации о текущем пользователе с бэкенда
 * Устанавливает req.user и res.locals.user
 */
module.exports = async function fetchUser(req, res, next) {
    const token = req.cookies?.token;

    if (token) {
        try {
            const response = await axios.get(`${process.env.BACKEND_URL}/api/auth/me`, {
                headers: {
                    Cookie: req.headers.cookie || '',
                    Authorization: `Bearer ${token}`
                },
                withCredentials: true
            });
            req.user = response.data.user;
            res.locals.user = response.data.user;
        } catch (error) {
            console.error('Ошибка при получении данных пользователя:', error.message);
            req.user = null;
            res.locals.user = null;
        }
    } else {
        req.user = null;
        res.locals.user = null;
    }

    next();
};