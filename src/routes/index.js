const express = require('express');
const authRoutes = require('./authRoutes');
const clientRoutes = require('./clientRoutes');
const petRoutes = require('./petRoutes');
const appointmentRoutes = require('./appointmentRoutes');

const router = express.Router();

router.use(authRoutes);
router.use(clientRoutes);
router.use(petRoutes);
router.use(appointmentRoutes);

module.exports = router;