const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');

// Контроллер для клиентских функций будет создан отдельно
const clientController = require('../controllers/clientController');

// Основные страницы клиентского интерфейса
router.get('/dashboard', authMiddleware.isClient, clientController.getDashboard);
router.get('/profile', authMiddleware.isClient, clientController.getProfile);
router.post('/profile', authMiddleware.isClient, clientController.updateProfile);

// Управление питомцами
router.get('/pets', authMiddleware.isClient, clientController.getAllPets);
router.get('/pets/add', authMiddleware.isClient, clientController.getAddPetForm);
router.post('/pets/add', authMiddleware.isClient, clientController.addPet);
router.get('/pets/:id', authMiddleware.isClient, clientController.getPet);
router.get('/pets/:id/edit', authMiddleware.isClient, clientController.getEditPetForm);
router.post('/pets/:id/edit', authMiddleware.isClient, clientController.updatePet);
router.post('/pets/:id/delete', authMiddleware.isClient, clientController.deletePet);
router.get('/pets/:id/history', authMiddleware.isClient, clientController.getPetHistory);

// Управление приемами
router.get('/appointments', authMiddleware.isClient, clientController.getAppointments);
router.get('/appointments/:id', authMiddleware.isClient, clientController.getAppointmentDetails);
router.post('/appointments/:id/cancel', authMiddleware.isClient, clientController.cancelAppointment);

// Запись на прием
router.get('/appointment', authMiddleware.isClient, clientController.getAppointmentForm);
router.post('/appointment', authMiddleware.isClient, clientController.createAppointment);

module.exports = router;
