const express = require('express');
const authRoutes = require('./authRoutes');
const clientRoutes = require('./clientRoutes');
const petRoutes = require('./petRoutes');
const appointmentRoutes = require('./appointmentRoutes');
const vetSchedulesRoutes = require('./vetRoutes');

const router = express.Router();

router.use(authRoutes);
router.use(clientRoutes);
router.use(petRoutes);
router.use(appointmentRoutes);
router.use(vetSchedulesRoutes);

module.exports = router;