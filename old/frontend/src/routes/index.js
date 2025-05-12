const express = require('express');
const mainRoutes = require('./main');
const authRoutes = require('./auth');
const adminRoutes = require('./admin');

const router = express.Router();

router.use(mainRoutes);
router.use(authRoutes);
router.use('/admin', adminRoutes);

module.exports = router;