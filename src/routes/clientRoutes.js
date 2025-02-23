const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { authenticate, authorize } = require('../middlewares/auth');

router.get('/clients', authenticate, authorize(['Administrator', 'Veterinarian']), clientController.getClients);
router.get('/clients/:id', authenticate, authorize(['Administrator', 'Veterinarian']), clientController.getClient);
router.patch('/clients/:id', authenticate, authorize(['Administrator']), clientController.updateClient);

module.exports = router;