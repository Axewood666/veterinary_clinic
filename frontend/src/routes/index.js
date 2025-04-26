const express = require('express');
const mainRoutes = require('./main');

const router = express.Router();

router.use(mainRoutes);

module.exports = router;