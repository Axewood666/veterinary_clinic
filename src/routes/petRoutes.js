const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const { authenticate, authorize } = require('../middlewares/auth');
const { petAddValidator } = require('../validators/petValidator');

router.get('/clients/:clientId/pets', authenticate, petController.getClientPets);
router.get('/pets', authenticate, authorize(['Admin', 'Vet', 'Manager']), petController.getAllPets);
router.post('/clients/:clientId/pets', petAddValidator(), authenticate, petController.addPet);

module.exports = router;