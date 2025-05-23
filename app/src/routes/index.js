const express = require('express');
const router = express.Router();
const homeController = require('../controllers/homeController.js');
const appointmentsController = require('../controllers/appointmentsController.js');

// Главная страница
router.get('/', homeController.renderHomePage);

// Страница услуг
router.get('/services', homeController.renderServicesPage);

// Страница контактов
router.get('/contacts', homeController.renderContactsPage);

// Страница "О нас"
router.get('/about', homeController.renderAboutPage);

// Страница ветеринаров
router.get('/vets', homeController.renderVetsPage);

// Страница записи на прием (доступна всем)
router.get('/appointment', homeController.renderAppointmentPage);
router.post('/appointment', appointmentsController.createAppointment);

// Страница благодарности после записи
router.get('/thank-you', homeController.renderThankYouPage);

module.exports = router; 