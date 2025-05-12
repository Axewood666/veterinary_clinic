const express = require('express');
const router = express.Router();
const clientController = require('../controllers/clientController');
const petController = require('../controllers/petController');
const { isAuthenticated, isAdmin, isVet } = require('../middlewares/authMiddleware');

router.get('/', isAuthenticated, (req, res, next) => {
    if (['admin', 'vet', 'manager'].includes(req.user.role.toLowerCase())) {
        next();
    } else {
        res.status(403).json({ error: 'Доступ запрещен' });
    }
}, clientController.getClients);

router.get('/:id', isAuthenticated, (req, res, next) => {
    if (['admin', 'vet', 'manager'].includes(req.user.role.toLowerCase())) {
        next();
    } else {
        res.status(403).json({ error: 'Доступ запрещен' });
    }
}, clientController.getClient);

router.get('/:id/pets', isAuthenticated, (req, res, next) => {
    if (['admin', 'vet', 'manager', 'client'].includes(req.user.role.toLowerCase())) {
        next();
    } else {
        res.status(403).json({ error: 'Доступ запрещен' });
    }
}, petController.getClientPets);


module.exports = router;