const express = require('express');
const userRoutes = require('./userRoutes');
const clientRoutes = require('./clientRoutes');

const router = express.Router();

router.use(userRoutes);
router.use(clientRoutes);

module.exports = router;