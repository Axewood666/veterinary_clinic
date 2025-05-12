const express = require('express');
const router = express.Router();
const appointmentController = require('../controllers/appointmentController');
const { isAuthenticated } = require('../middlewares/authMiddleware');

router.get('/', isAuthenticated, appointmentController.getAllAppointments);

router.get('/filter', isAuthenticated, appointmentController.filterAppointments);

router.get('/:id', isAuthenticated, appointmentController.getAppointmentById);

router.post('/', isAuthenticated, appointmentController.createAppointment);

router.put('/:id', isAuthenticated, appointmentController.updateAppointment);

router.post('/:id/cancel', isAuthenticated, appointmentController.cancelAppointment);

router.post('/:id/complete', isAuthenticated, appointmentController.completeAppointment);

module.exports = router;