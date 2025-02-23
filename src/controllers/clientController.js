const Client = require('../models/client');

exports.getClients = async (req, res) => {
    try {
        const clients = await Client.findAll();
        res.status(200).json(clients);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}