const express = require('express');
const router = express.Router();

const vetController = require('../controllers/vetController');
const { isAuthenticated, isAdmin } = require('../middlewares/authMiddleware');

router.get('/schedules', isAuthenticated, vetController.getVetSchedules);
router.get('/schedules/:vetid', isAuthenticated, vetController.getVetScheduleById);
router.get('/schedules/:vetid/slots', isAuthenticated, vetController.getAvailableSlots);
router.get('/list', isAuthenticated, vetController.getVeterinarians);

router.get('/', isAuthenticated, vetController.getAllVets);
router.get('/:id', isAuthenticated, vetController.getVetById);
router.get('/:id/appointments', isAuthenticated, vetController.getVetAppointments);
router.post('/:id/toggle-status', isAuthenticated, isAdmin, vetController.toggleVetStatus);

router.post('/', isAuthenticated, isAdmin, vetController.createVet);
router.put('/:id', isAuthenticated, isAdmin, vetController.updateVet);

module.exports = router;