const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const { authenticate, authorize } = require('../middlewares/auth');

router.get('/clients', authenticate, authorize(['Admin', 'Vet']), clientController.getClients);
router.get('/clients/:id', authenticate, authorize(['Admin', 'Vet']), clientController.getClient);
// router.patch('/clients/:id', authenticate, authorize(['Admin']), clientController.updateClient);

module.exports = router;