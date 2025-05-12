/**
 * Middleware для проверки авторизации и ролей пользователя
 * Использует данные пользователя, полученные через fetchUser middleware
 */

// Проверка авторизации
const isAuthenticated = (req, res, next) => {
    if (!req.user) {
        return res.redirect('/login');
    }
    next();
};

// Проверка на роль администратора
const isAdmin = (req, res, next) => {
    if (!req.user || req.user.role !== 'Admin') {
        return res.status(403).render('pages/error', {
            title: 'Доступ запрещен',
            message: 'Доступ запрещен',
            error: { message: 'У вас нет прав администратора для доступа к этой странице' }
        });
    }
    next();
};

// Проверка на роль ветеринара
const isVet = (req, res, next) => {
    if (!req.user || req.user.role !== 'Vet') {
        return res.status(403).render('pages/error', {
            title: 'Доступ запрещен',
            message: 'Доступ запрещен',
            error: { message: 'У вас нет прав ветеринара для доступа к этой странице' }
        });
    }
    next();
};

// Проверка на роль клиента
const isClient = (req, res, next) => {
    if (!req.user || req.user.role !== 'Client') {
        return res.status(403).render('pages/error', {
            title: 'Доступ запрещен',
            message: 'Доступ запрещен',
            error: { message: 'У вас нет прав клиента для доступа к этой странице' }
        });
    }
    next();
};

module.exports = {
    isAuthenticated,
    isAdmin,
    isVet,
    isClient
}; 