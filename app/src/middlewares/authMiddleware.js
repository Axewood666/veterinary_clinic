/**
 * Middleware для проверки аутентификации пользователей
 * с использованием JWT-токена
 */

exports.requireAuth = (req, res, next) => {
    if (!req.user) {
        if (req.originalUrl.startsWith('/api')) {
            return res.status(401).json({ error: 'Требуется авторизация' });
        }

        return res.redirect(`/auth/login?redirect=${req.originalUrl}`);
    }

    next();
};

exports.requireAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'Admin') {
        if (req.originalUrl.startsWith('/api')) {
            return res.status(403).json({ error: 'Доступ запрещен' });
        }

        return res.status(403).render('pages/error', {
            title: 'Доступ запрещен',
            message: 'У вас нет прав для доступа к этой странице',
            error: { message: 'Требуются права администратора' }
        });
    }

    next();
};

exports.requireVet = (req, res, next) => {
    if (!req.user || (req.user.role !== 'Vet' && req.user.role !== 'Admin')) {
        if (req.originalUrl.startsWith('/api')) {
            return res.status(403).json({ error: 'Доступ запрещен' });
        }

        return res.status(403).render('pages/error', {
            title: 'Доступ запрещен',
            message: 'У вас нет прав для доступа к этой странице',
            error: { message: 'Требуются права ветеринара' }
        });
    }

    next();
};

exports.requireEmployee = (req, res, next) => {
    if (!req.user || !['Admin', 'Vet', 'Manager'].includes(req.user.role)) {
        if (req.originalUrl.startsWith('/api')) {
            return res.status(403).json({ error: 'Доступ запрещен' });
        }

        return res.status(302).redirect('/auth/login');
    }

    next();
};

exports.isClient = (req, res, next) => {
    if (!req.user) {
        if (req.originalUrl.startsWith('/api')) {
            return res.status(403).json({ error: 'Доступ запрещен' });
        }

        return res.status(302).redirect('/auth/login');
    }

    next();
};