const express = require('express');
const mainRoutes = require('./main');
const authRoutes = require('./auth');
const adminRoutes = require('./adminPanel');
const router = express.Router();

router.use(mainRoutes);
router.use(authRoutes);
router.use(adminRoutes);

module.exports = router;