const Client = require('../models/client');
const Pet = require('../models/pet');
const { validationResult } = require('express-validator');

exports.addPet = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const clientId = req.params.clientId;
        const petData = req.body;
        const user = req.user;

        if (user.role === 'user' && user.clientId !== clientId) {
            return res.status(403).json({ message: 'You are not authorized to add a pet to this client' });
        }

        const client = await Client.findByPk(clientId);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        const newPet = await Pet.create({ ...petData, clientid: clientId });

        res.status(201).json(newPet);
    } catch (error) {
        console.error('Error adding pet:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};