const db = require('../db/database');
const logger = require('../utils/logger');
exports.getAll = async (req, res) => {
    try {
        const { name, type, owner_id, limit, offset } = req.query;
        let query = db('pets')
            .leftJoin('users', 'pets.userid', 'users.userid')
            .select(
                'pets.*',
                'users.name as ownerName',
                'users.username as ownerUsername'
            );
        if (name) {
            query = query.whereRaw('LOWER(pets.name) LIKE ?', [`%${name.toLowerCase()}%`]);
        }
        if (type) {
            query = query.where('pets.type', type);
        }
        if (owner_id) {
            query = query.where('pets.userid', owner_id);
        }
        query = query.orderBy('pets.name', 'asc');
        if (limit) {
            query = query.limit(parseInt(limit));
            if (offset) {
                query = query.offset(parseInt(offset));
            }
        }
        const pets = await query;
        res.json(pets);
    } catch (err) {
        logger.error(`Ошибка при получении списка питомцев: ${err.message}`);
        res.status(500).json({ error: 'Ошибка при получении списка питомцев' });
    }
};
exports.getOne = async (req, res) => {
    try {
        const pet = await db('pets')
            .leftJoin('users', 'pets.userid', 'users.userid')
            .select(
                'pets.*',
                'users.name as ownerName',
                'users.username as ownerUsername'
            )
            .where('pets.petid', req.params.id)
            .first();
        if (!pet) {
            return res.status(404).json({ error: 'Питомец не найден' });
        }
        res.json(pet);
    } catch (err) {
        logger.error(`Ошибка при получении данных питомца: ${err.message}`);
        res.status(500).json({ error: 'Ошибка при получении данных питомца' });
    }
};
exports.create = async (req, res) => {
    try {
        const {
            name,
            species,
            breed,
            age,
            gender,
            weight,
            description,
            photo,
            owner_id
        } = req.body;
        if (owner_id) {
            const owner = await db('users')
                .where('userid', owner_id)
                .first();
            if (!owner) {
                return res.status(400).json({ error: 'Указанный владелец не найден' });
            }
        }
        const [id] = await db('pets').insert({
            name,
            species,
            breed,
            age: age || null,
            gender: gender || null,
            weight: weight || null,
            description,
            photo,
            owner_id
        }, 'petid');
        const newPet = await db('pets')
            .where('petid', id)
            .first();
        res.status(201).json(newPet);
    } catch (err) {
        logger.error(`Ошибка при создании питомца: ${err.message}`);
        res.status(500).json({ error: 'Ошибка при создании питомца' });
    }
};
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            species,
            breed,
            age,
            gender,
            weight,
            description,
            photo,
            owner_id
        } = req.body;
        const pet = await db('pets')
            .where('petid', id)
            .first();
        if (!pet) {
            return res.status(404).json({ error: 'Питомец не найден' });
        }
        if (owner_id && owner_id !== pet.owner_id) {
            const owner = await db('users')
                .where('userid', owner_id)
                .first();
            if (!owner) {
                return res.status(400).json({ error: 'Указанный владелец не найден' });
            }
        }
        const updateData = {
            updated_at: new Date()
        };
        if (name !== undefined) updateData.name = name;
        if (species !== undefined) updateData.species = species;
        if (breed !== undefined) updateData.breed = breed;
        if (age !== undefined) updateData.age = age;
        if (gender !== undefined) updateData.gender = gender;
        if (weight !== undefined) updateData.weight = weight;
        if (description !== undefined) updateData.description = description;
        if (photo !== undefined) updateData.photo = photo;
        if (owner_id !== undefined) updateData.owner_id = owner_id;
        await db('pets')
            .where('petid', id)
            .update(updateData);
        const updatedPet = await db('pets')
            .where('petid', id)
            .first();
        res.json(updatedPet);
    } catch (err) {
        logger.error(`Ошибка при обновлении питомца: ${err.message}`);
        res.status(500).json({ error: 'Ошибка при обновлении питомца' });
    }
};
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const pet = await db('pets')
            .where('petid', id)
            .first();
        if (!pet) {
            return res.status(404).json({ message: 'Питомец не найден' });
        }
        const existingAppointments = await db('appointments')
            .where('petid', id)
            .first();
        if (existingAppointments) {
            return res.status(400).json({ message: 'Невозможно удалить питомца, так как у него имеются записи о приемах. Пожалуйста, сначала удалите или архивируйте связанные приемы.' });
        }
        await db('pets')
            .where('petid', id)
            .del();
        res.json({ message: 'Питомец успешно удален' });
    } catch (err) {
        logger.error(`Ошибка при удалении питомца: ${err.message}`);
        res.status(500).json({ message: 'Ошибка при удалении питомца' });
    }
};
exports.getHistory = async (req, res) => {
    try {
        const { id } = req.params;
        const pet = await db('pets')
            .where('petid', id)
            .first();
        if (!pet) {
            return res.status(404).json({ error: 'Питомец не найден' });
        }
        const appointments = await db('appointments')
            .join('users', 'appointments.vetid', 'users.userid')
            .select(
                'appointments.*',
                'users.name as vetName',
                'users.username as vetUsername',
            )
            .where('petid', id)
            .orderBy('date', 'desc');
        res.json(appointments);
    } catch (err) {
        logger.error(`Ошибка при получении истории приемов питомца: ${err.message}`);
        res.status(500).json({ error: 'Ошибка при получении истории приемов питомца' });
    }
}; 