const jwt = require('jsonwebtoken');
const db = require('../../config/db');

exports.isAuthenticated = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(' ')[1] || req.cookies.token;

        if (!token) {
            return res.status(401).json({ error: 'Необходима авторизация' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        const user = await db('users')
            .where('userid', decoded.userid)
            .first();

        if (!user) {
            return res.status(401).json({ error: 'Пользователь не найден' });
        }

        req.user = {
            userid: user.userid,
            name: user.name,
            email: user.email,
            role: user.role
        };

        next();
    } catch (error) {
        if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
            return res.status(401).json({ error: 'Недействительный или истекший токен' });
        }
        console.error('Authentication error:', error);
        res.status(500).json({ error: 'Ошибка аутентификации' });
    }
};

exports.isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        return res.status(403).json({ error: 'Доступ запрещен. Требуются права администратора.' });
    }
    next();
};

exports.isVet = (req, res, next) => {
    if (!req.user || req.user.role !== 'vet') {
        return res.status(403).json({ error: 'Доступ запрещен. Требуются права ветеринара.' });
    }
    next();
};

exports.isClient = (req, res, next) => {
    if (!req.user || req.user.role !== 'client') {
        return res.status(403).json({ error: 'Доступ запрещен. Требуются права клиента.' });
    }
    next();
};

/**
 * Добавлен метод authorize для обратной совместимости
 * Проверяет, имеет ли авторизованный пользователь одну из допустимых ролей
 * @param {Array} allowedRoles - Массив допустимых ролей
 * @returns {function} Middleware функция
 */
exports.authorize = (allowedRoles) => (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role.toLowerCase())) {
        return res.status(403).json({ error: 'Доступ запрещен. У вас нет необходимых прав.' });
    }
    next();
};

/**
 * Проверка, является ли пользователь владельцем ресурса или имеет права администратора/ветеринара
 * @param {string} resource - Название таблицы ресурса
 * @param {string} idField - Название поля идентификатора ресурса
 * @param {string} ownerField - Название поля, содержащего идентификатор владельца (ownerId, clientId, etc.)
 * @returns {function} Middleware функция
 */
exports.isResourceOwner = (resource, idField, ownerField = 'ownerId') => async (req, res, next) => {
    try {
        const resourceId = req.params[idField];

        if (!resourceId) {
            return res.status(400).json({ error: 'Не указан идентификатор ресурса' });
        }

        const result = await db(resource)
            .where(idField, resourceId)
            .first();

        if (!result) {
            return res.status(404).json({ error: 'Ресурс не найден' });
        }

        const ownerId = result[ownerField];

        if (!ownerId) {
            return res.status(500).json({ error: 'Не удалось определить владельца ресурса' });
        }

        if (req.user.userid !== ownerId && req.user.role !== 'admin' && req.user.role !== 'vet') {
            return res.status(403).json({ error: 'Доступ запрещен. Вы не являетесь владельцем этого ресурса.' });
        }

        next();
    } catch (error) {
        console.error('Resource owner check error:', error);
        res.status(500).json({ error: 'Ошибка при проверке владельца ресурса' });
    }
}; 