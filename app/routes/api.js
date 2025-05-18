const express = require('express');
const router = express.Router();

// Контроллеры
const vetsController = require('../controllers/vetsController');
const petsController = require('../controllers/petsController');
const appointmentsController = require('../controllers/appointmentsController');
const adminController = require('../controllers/adminController');

// Маршруты для ветеринаров
router.get('/vets', vetsController.getAll);
router.get('/vets/:id', vetsController.getOne);
router.post('/vets', vetsController.create);
router.put('/vets/:id', vetsController.update);
router.delete('/vets/:id', vetsController.delete);
router.get('/vets/:id/appointments', vetsController.getAppointments);

// Маршруты для питомцев
router.get('/pets', petsController.getAll);
router.get('/pets/filter', petsController.getAll);
router.get('/pets/:id', petsController.getOne);
router.post('/pets', petsController.create);
router.put('/pets/:id', petsController.update);
router.delete('/pets/:id', petsController.delete);
router.get('/pets/:id/history', petsController.getHistory);

// Маршруты для приемов
router.get('/appointments', appointmentsController.getAll);
router.get('/appointments/:id', appointmentsController.getOne);
router.post('/appointments', appointmentsController.create);
router.put('/appointments/:id', appointmentsController.update);
router.delete('/appointments/:id', appointmentsController.delete);

// Маршруты для админ-панели
router.get('/admin/dashboard', adminController.getDashboardStats);
router.get('/admin/settings', adminController.getSettings);
router.put('/admin/settings', adminController.updateSettings);

module.exports = router; 