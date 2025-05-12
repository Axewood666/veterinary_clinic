const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const { isAuthenticated, isAdmin } = require('../middlewares/authMiddleware');

// Получение списка всех питомцев
router.get('/', isAuthenticated, petController.getAllPets);

// Получение питомцев с фильтрацией
router.get('/filter', isAuthenticated, petController.filterPets);

// Получение данных конкретного питомца
router.get('/:id', isAuthenticated, petController.getPetById);

// Получение списка приемов питомца
router.get('/:id/appointments', isAuthenticated, petController.getPetAppointments);

// Создание нового питомца
router.post('/', isAuthenticated, petController.createPet);

// Обновление данных питомца
router.put('/:id', isAuthenticated, petController.updatePet);

// Удаление питомца (только для админа)
router.delete('/:id', isAuthenticated, isAdmin, petController.deletePet);

module.exports = router;