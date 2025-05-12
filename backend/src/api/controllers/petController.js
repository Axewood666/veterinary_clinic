const { Users, Pets } = require('../models');
const { validationResult } = require('express-validator');
const _ = require('lodash');

exports.getAllPets = async (req, res) => {
    try {
        const pets = await Pets.getAllWithRelations();
        res.json(pets);
    } catch (error) {
        console.error('Error getting all pets:', error);
        res.status(500).json({ error: 'Не удалось получить список питомцев' });
    }
};

exports.filterPets = async (req, res) => {
    try {
        const { type, ownerId } = req.query;
        let query = Pets.getAllWithRelations();

        if (type) {
            query = query.where('pets.type', type);
        }

        if (ownerId) {
            query = query.where('pets.userid', ownerId);
        }

        const pets = await query;
        res.json(pets);
    } catch (error) {
        console.error('Error filtering pets:', error);
        res.status(500).json({ error: 'Не удалось получить отфильтрованный список питомцев' });
    }
};

exports.getPetById = async (req, res) => {
    try {
        const { id } = req.params;
        const pet = await Pets.getById(id);

        if (!pet) {
            return res.status(404).json({ error: 'Питомец не найден' });
        }

        // Получаем информацию о владельце
        const owner = await Users.getById(pet.userid);
        const result = {
            ...pet,
            ownerName: owner?.name || 'Неизвестно',
            ownerId: owner?.userid
        };

        res.json(result);
    } catch (error) {
        console.error('Error getting pet by id:', error);
        res.status(500).json({ error: 'Не удалось получить данные питомца' });
    }
};

exports.getPetAppointments = async (req, res) => {
    try {
        const { id } = req.params;

        // Проверяем существование питомца
        const pet = await Pets.getById(id);
        if (!pet) {
            return res.status(404).json({ error: 'Питомец не найден' });
        }

        // Получаем приемы питомца через модель Appointments
        const { Appointments } = require('../models');
        const appointments = await Appointments.getAllWithRelations()
            .where('appointments.petid', id)
            .orderBy('appointments.date', 'desc')
            .orderBy('appointments.time', 'desc');

        res.json(appointments);
    } catch (error) {
        console.error('Error getting pet appointments:', error);
        res.status(500).json({ error: 'Не удалось получить приемы питомца' });
    }
};

exports.getClientPets = async (req, res) => {
    try {
        const { id } = req.params;

        const client = await Users.getById(id);
        if (!client) {
            return res.status(404).json({ error: 'Клиент не найден' });
        }

        if (req.user && req.user.role === 'Client') {
            if (id !== req.user.userid.toString()) {
                return res.status(403).json({ error: 'Доступ запрещен' });
            }
        }

        const pets = await Pets.getByUserId(id);
        res.json({ pets });
    } catch (error) {
        console.error('Error getting client pets:', error);
        res.status(500).json({ error: 'Не удалось получить питомцев клиента' });
    }
};

exports.createPet = async (req, res) => {
    try {
        const { name, type, breed, age, gender, ownerId, medicalHistory } = req.body;
        if (!name || !type || !ownerId) {
            return res.status(400).json({ error: 'Имя, тип и владелец обязательны' });
        }

        // Проверяем, существует ли клиент
        const client = await Users.getById(ownerId);
        if (!client || client.role.toLowerCase() !== 'client') {
            return res.status(404).json({ error: 'Клиент не найден' });
        }

        // Создаем нового питомца
        const petData = {
            name,
            type,
            breed: breed || '',
            age: age || null,
            gender: gender || null,
            userid: ownerId,
            medicalhistory: medicalHistory || ''
        };

        const newPet = await Pets.create(petData);

        res.status(201).json({
            success: true,
            message: 'Питомец успешно создан',
            pet: {
                ...newPet[0],
                ownerName: client.name
            }
        });
    } catch (error) {
        console.error('Error creating pet:', error);
        res.status(500).json({ error: 'Не удалось создать питомца' });
    }
};

exports.updatePet = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, type, breed, age, gender, ownerId, medicalHistory } = req.body;

        // Проверяем, существует ли питомец
        const pet = await Pets.getById(id);
        if (!pet) {
            return res.status(404).json({ error: 'Питомец не найден' });
        }

        // Если указан новый владелец, проверяем его существование
        if (ownerId && ownerId !== pet.userid) {
            const client = await Users.getById(ownerId);
            if (!client || client.role.toLowerCase() !== 'client') {
                return res.status(404).json({ error: 'Клиент не найден' });
            }
        }

        // Обновляем данные питомца
        const updateData = {
            name: name || pet.name,
            type: type || pet.type,
            breed: breed !== undefined ? breed : pet.breed,
            age: age !== undefined ? age : pet.age,
            gender: gender !== undefined ? gender : pet.gender,
            userid: ownerId || pet.userid,
            medicalhistory: medicalHistory !== undefined ? medicalHistory : pet.medicalhistory
        };

        const updatedPet = await Pets.update(id, updateData);

        // Получаем информацию о владельце
        const owner = await Users.getById(updatedPet[0].userid);

        res.json({
            success: true,
            message: 'Данные питомца успешно обновлены',
            pet: {
                ...updatedPet[0],
                ownerName: owner?.name || 'Неизвестно',
                ownerId: owner?.userid
            }
        });
    } catch (error) {
        console.error('Error updating pet:', error);
        res.status(500).json({ error: 'Не удалось обновить данные питомца' });
    }
};

exports.deletePet = async (req, res) => {
    try {
        const { id } = req.params;

        // Проверяем, существует ли питомец
        const pet = await Pets.getById(id);
        if (!pet) {
            return res.status(404).json({ error: 'Питомец не найден' });
        }

        // Проверяем, есть ли у питомца активные приемы
        const { Appointments } = require('../models');
        const activeAppointments = await Appointments.getAll()
            .where({ petid: id, status: 'scheduled' })
            .count('appointmentid as count')
            .then(result => result[0].count);

        if (activeAppointments > 0) {
            return res.status(400).json({
                error: 'Нельзя удалить питомца с активными приемами. Отмените все приемы перед удалением.'
            });
        }

        // Удаляем питомца
        await Pets.delete(id);

        res.json({
            success: true,
            message: 'Питомец успешно удален'
        });
    } catch (error) {
        console.error('Error deleting pet:', error);
        res.status(500).json({ error: 'Не удалось удалить питомца' });
    }
};

// Метод для обратной совместимости
exports.addPet = async (req, res) => {
    try {
        const { clientId } = req.params;
        const petData = req.body;

        // Добавляем ID клиента к данным питомца
        petData.ownerId = clientId;

        // Создаем нового питомца через метод createPet
        req.body = petData;
        return exports.createPet(req, res);
    } catch (error) {
        console.error('Error adding pet:', error);
        res.status(500).json({ error: 'Не удалось добавить питомца' });
    }
};