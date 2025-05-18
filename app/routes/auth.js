const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');

// Страницы аутентификации
router.get('/login', authController.renderLogin);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

// Регистрация пользователя
router.get('/register', authController.renderRegister);
router.post('/register', authController.register);

// Приглашение сотрудника
router.post('/invite', authController.sendInvite);
router.post('/invite/:token', authController.registerByInvite);

// Восстановление пароля
router.get('/forgot-password', authController.renderForgotPassword);
router.post('/forgot-password', authController.forgotPassword);
router.get('/reset-password/:token', authController.renderResetPassword);
router.post('/reset-password/:token', authController.resetPassword);

// Профиль пользователя (требует авторизации)
router.get('/profile', authMiddleware.requireAuth, authController.renderProfile);
router.post('/profile', authMiddleware.requireAuth, authController.updateProfile);
router.post('/change-password', authMiddleware.requireAuth, authController.changePassword);

module.exports = router; 