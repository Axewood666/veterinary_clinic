const express = require('express');
const router = express.Router();
const petController = require('../controllers/petController');
const { authenticate } = require('../middlewares/auth');
const { petAddValidator } = require('../validators/petValidator');

router.post('/clients/:clientId/pets', petAddValidator(), authenticate, petController.addPet);

module.exports = router;