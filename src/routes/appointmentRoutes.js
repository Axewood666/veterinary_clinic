const express = require('express');
const router = express.Router();
const appointmentControler = require('../controllers/appointmentController');
const { authenticate, authorize } = require('../middlewares/auth');
const { validateAppointment } = require('../validators/appointmentsValidator');

router.get('/clients/:userid/appointments', authenticate, appointmentControler.getAppointments)
router.post('/clients/:userid/appointments', authenticate, validateAppointment, appointmentControler.createAppointment)
router.patch('/clients/:userid/appointments/:appointmentid', authenticate, authorize(['Vet', 'Manager', 'Admin']), appointmentControler.acceptAppointment)
router.delete('/clients/:userid/appointments/:appointmentid', authenticate, appointmentControler.deleteAppointment)
router.put('/clients/:userid/appointments/:appointmentid', authenticate, authorize(['Vet', 'Manager', 'Admin']), appointmentControler.updateAppointment)

module.exports = router;