/**
 * Middleware для проверки аутентификации пользователей
 * с использованием JWT-токена
 */

exports.requireAuth = (req, res, next) => {
    if (!req.user) {
        // Если запрос к API, возвращаем ошибку в формате JSON
        if (req.originalUrl.startsWith('/api')) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }

        // Для обычных страниц - перенаправляем на страницу входа
        return res.redirect(`/auth/login?redirect=${req.originalUrl}`);
    }

    next();
};

exports.requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'admin') {
        // Если запрос к API, возвращаем ошибку в формате JSON
        if (req.originalUrl.startsWith('/api')) {
            return res.status(403).json({ error: 'Доступ запрещен' });
        }

        // Для обычных страниц - отображаем страницу с ошибкой доступа
        return res.status(403).render('pages/error', {
            title: 'Доступ запрещен',
            message: 'У вас нет прав для доступа к этой странице',
            error: { message: 'Требуются права администратора' }
        });
    }

    next();
};

exports.requireVet = (req, res, next) => {
    if (!req.user || (req.user.role !== 'vet' && req.user.role !== 'admin')) {
        // Если запрос к API, возвращаем ошибку в формате JSON
        if (req.originalUrl.startsWith('/api')) {
            return res.status(403).json({ error: 'Доступ запрещен' });
        }

        // Для обычных страниц - отображаем страницу с ошибкой доступа
        return res.status(403).render('pages/error', {
            title: 'Доступ запрещен',
            message: 'У вас нет прав для доступа к этой странице',
            error: { message: 'Требуются права ветеринара' }
        });
    }

    next();
}; 