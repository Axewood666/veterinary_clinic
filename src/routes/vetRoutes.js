const express = require('express');
const router = express.Router();

const vetSchedulesController = require('../controllers/vetController');
const { authenticate, authorize } = require('../middlewares/auth');

router.get('/vets/shedules', authenticate, authorize(['Vet', 'Manager', 'Admin']), vetSchedulesController.getVetSchedules);
router.get('/vets/shedules/:vetid', authenticate, authorize(['Vet', 'Manager', 'Admin']), vetSchedulesController.getVetScheduleById);
router.get('/vets/shedules/:vetid/slots', authenticate, vetSchedulesController.getAvailableSlots);
router.get('/vets', authenticate, vetSchedulesController.getVeterinarians);

module.exports = router;