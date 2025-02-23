const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');

router.get('/clients', clientController.getClients);
router.get('/clients/pets', clientController.getClients);

module.exports = router;