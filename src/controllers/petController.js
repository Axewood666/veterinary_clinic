const { Client, Pet } = require('../models/');
const { validationResult } = require('express-validator');

exports.addPet = async(req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const clientId = req.params.clientId;
        const petData = req.body;
        const user = req.user;

        if (user.role === 'user' && user.clientId !== clientId) {
            return res.status(403).json({ message: 'You are not allowed to add a pet to this client' });
        }

        const client = await Client.findByPk(clientId);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        let newPet = await Pet.create({...petData, clientid: clientId });

        res.status(201).json(newPet);
    } catch (error) {
        console.error('Error adding pet:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

exports.getClientPets = async(req, res) => {
    try {
        const clientId = req.params.clientId;
        const user = req.user;

        if (user.role === 'user' && user.clientId !== clientId) {
            return res.status(403).json({ message: 'You are not allowed to receive this clients pets' });
        }

        const client = await Client.findByPk(clientId);
        if (!client) {
            return res.status(404).json({ message: 'Client not found' });
        }

        const attributes = ['clientid', 'petid', 'name', 'age', 'breed', 'medicalhistory'];
        const pets = await Pet.findAll({
            attributes: attributes,
            include: [{
                model: Client,
                attributes: ['name']
            }]
        });

        let response = {
            clients: [{
                name: pets[0].client.name,
                clientid: pets[0].clientid,
                pets: pets.map(pet => ({
                    petid: pet.petid,
                    name: pet.name,
                    age: pet.age,
                    breed: pet.breed,
                    medicalhistory: pet.medicalhistory
                }))
            }]

        }
        res.status(201).json(response);
    } catch (error) {
        console.error('Error get pets:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};


exports.getAllPets = async(req, res) => {
    try {
        const attributes = ['clientid', 'petid', 'name', 'age', 'breed', 'medicalhistory'];
        const pets = await Pet.findAll({
            attributes: attributes,
            include: [{
                model: Client,
                attributes: ['name']
            }]
        });

        let response = {
            "clients": []
        };

        const groupedByClient = pets.reduce((acc, pet) => {
            const key = pet.clientid;
            if (!acc[key]) {
                acc[key] = { name: pet.client.name, clientid: key, pets: [] };
            }
            acc[key].pets.push({
                petid: pet.petid,
                name: pet.name,
                age: pet.age,
                breed: pet.breed,
                medicalhistory: pet.medicalhistory
            });
            return acc;
        }, {});

        response.clients = Object.values(groupedByClient);

        res.status(201).json(response);
    } catch (error) {
        console.error('Error get pets:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};