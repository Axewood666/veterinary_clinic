const express = require('express');
const router = express.Router();

const authRoutes = require('./authRoutes');
const vetRoutes = require('./vetRoutes');
const petRoutes = require('./petRoutes');
const clientRoutes = require('./clientRoutes');
const appointmentRoutes = require('./appointmentRoutes');
const adminRoutes = require('./adminRoutes');

router.use('/auth', authRoutes);

router.use('/vets', vetRoutes);

router.use('/pets', petRoutes);

router.use('/clients', clientRoutes);

router.use('/appointments', appointmentRoutes);

router.use('/admin', adminRoutes);

module.exports = router;