const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const authenticate = require('../middlewares/auth');

router.get('/clients', authenticate, clientController.getClients);
// router.get('/clients/pets', clientController.getClients);

module.exports = router;