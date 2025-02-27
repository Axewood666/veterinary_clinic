const express = require('express');
const router = express.Router();
const appointmentControler = require('../controllers/appointmentController');
const { authenticate, authorize } = require('../middlewares/auth');

router.POST('/clients', authenticate, clientController.getClients);
router.get('/user/:userid/appointments', authenticate, )

module.exports = router;