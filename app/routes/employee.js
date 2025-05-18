const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { requireAuth, requireEmployee } = require('../middlewares/authMiddleware');

router.use(requireAuth);
router.use(requireEmployee);

// Управление клиентами
router.get('/clients', adminController.renderClients);
router.get('/clients/:id', adminController.getClientDetails);

// Управление питомцами
router.get('/pets', adminController.renderPets);

// Управление приемами
router.get('/appointments', adminController.renderAppointments);

module.exports = router;