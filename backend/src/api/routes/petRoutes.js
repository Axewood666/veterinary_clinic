const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const { authenticate, authorize } = require('../middlewares/auth');
const { petAddValidator } = require('../validators/petValidator');
const validateResult = require('../middlewares/validateResult');

router.get('/clients/:clientId/pets', authenticate, petController.getClientPets);
router.get('/pets', authenticate, authorize(['Admin', 'Vet', 'Manager']), petController.getAllPets);
router.post('/clients/:clientId/pets', authenticate, petAddValidator(), validateResult, petController.addPet);

module.exports = router;