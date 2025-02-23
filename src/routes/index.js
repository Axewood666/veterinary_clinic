const express = require('express');
const userRoutes = require('./userRoutes');
const clientRoutes = require('./clientRoutes');
const petRoutes = require('./petRoutes');

const router = express.Router();

router.use(userRoutes);
router.use(clientRoutes);
router.use(petRoutes);

module.exports = router;