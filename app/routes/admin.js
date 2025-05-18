const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');

// Все маршруты админ-панели требуют аутентификации и роли админа
router.use(authMiddleware.requireAuth);
router.use(authMiddleware.requireAdmin);

// Дашборд
router.get('/dashboard', adminController.renderDashboard);

// Управление сотрудниками
router.get('/invite', adminController.renderInvite);

// Управление ветеринарами
router.get('/vets', adminController.renderVets);
router.get('/vets/new', adminController.renderNewVetForm);
router.get('/vets/:id/edit', adminController.renderEditVetForm);

// Управление менеджерами
// router.get('/managers', adminController.renderManagers);
// router.get('/managers/:id', adminController.getManagerDetails);

// Настройки клиники
router.get('/settings', adminController.renderSettings);

module.exports = router; 