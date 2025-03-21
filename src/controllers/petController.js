const { Users, Pets } = require('../models/');
const { validationResult } = require('express-validator');
const _ = require('lodash');

exports.addPet = async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }
    try {
        const clientId = req.params.clientId;
        const petData = req.body;
        const user = req.user;

        if (user.role === 'Client' && user.userid !== clientId) {
            return res.status(403).json({ message: 'You are not allowed to add a pet to this client' });
        }

        const client = await Users.getById(clientId);
        if (_.isEmpty(client)) {
            return res.status(404).json({ message: 'Client not found' });
        }

        let [newPet] = await Pets.create({ ...petData, userid: clientId });

        res.status(201).json(newPet);
    } catch (error) {
        console.error('Error adding pet:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

exports.getClientPets = async (req, res) => {
    try {
        const clientId = req.params.clientId;
        const user = req.user;
        if (user.role === 'Client' && user.userid !== clientId) {
            return res.status(403).json({ message: 'You are not allowed to receive this client\'s pets' });
        }
        const client = await Users.getById(clientId);
        if (_.isEmpty(client)) {
            return res.status(404).json({ message: 'Client not found' });
        }

        const pets = await Pets.getAll()
            .select('pets.userid', 'pets.petid', 'pets.name', 'pets.type', 'pets.gender',
                'pets.age', 'pets.breed', 'pets.medicalhistory', 'users.name as user_name')
            .where({ 'pets.userid': clientId })
            .join('users', 'pets.userid', 'users.userid');

        if (_.isEmpty(pets)) {
            res.status(404).json({ error: "You don't have any pets" });
            return;
        }

        let response = {
            name: pets[0].user_name,
            clientid: pets[0].userid,
            pets: pets.map(pet => ({
                petid: pet.petid,
                name: pet.name,
                type: pet.type,
                gender: pet.gender,
                age: pet.age,
                breed: pet.breed,
                medicalhistory: pet.medicalhistory
            }))
        }
        res.status(201).json(response);
    } catch (error) {
        console.error('Error get pets:', error);
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
};

exports.getAllPets = async (req, res) => {
    try {
        const pets = await Pets.getAll()
            .select('pets.userid', 'pets.petid', 'pets.name', 'pets.type', 'pets.gender',
                'pets.age', 'pets.breed', 'pets.medicalhistory', 'users.name as user_name')
            .join('users', 'pets.userid', 'users.userid');

        if (_.isEmpty(pets)) {
            res.status(404).json({ error: "No pets" });
            return;
        }

        let response = {
            "clients": []
        };

        const groupedByClient = pets.reduce((acc, pet) => {
            const key = pet.userid;
            if (!acc[key]) {
                acc[key] = { name: pet.user_name, clientid: key, pets: [] };
            }
            acc[key].pets.push({
                petid: pet.petid,
                name: pet.name,
                type: pet.type,
                gender: pet.gender,
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