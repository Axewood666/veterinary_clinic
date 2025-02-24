const { Client } = require('../models/');
const { validationResult } = require('express-validator');

exports.getClients = async(req, res) => {
    try {
        const clients = await Client.findAll();
        res.status(200).json(clients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.getClient = async(req, res) => {
    try {
        const clientid = req.params.id;
        const clients = await Client.findOne({ where: { clientid: clientid } });
        res.status(200).json(clients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.updateClient = async(req, res) => {
    try {
        const clientId = req.params.id;
        const updates = req.body;

        const { clientid, userid, ...filteredUpdates } = updates;

        if (!filteredUpdates || Object.keys(filteredUpdates).length === 0) {
            return res.status(400).json({ message: 'Not valid data' });
        }

        const [updatedRowsCount, updatedClients] = await Client.update(filteredUpdates, {
            where: { clientid: clientId },
            returning: true
        });

        if (updatedRowsCount === 0 || updatedClients.length === 0) {
            return res.status(404).json({ message: 'Client not found' });
        }

        const updatedClient = updatedClients[0];

        res.status(200).json(updatedClient);
    } catch (error) {
        console.error('Error updating client:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};