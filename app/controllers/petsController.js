const db = require('../config/database');
const logger = require('../utils/logger');

/**
 * Получение всех питомцев
 */
exports.getAll = async (req, res) => {
    try {
        const { name, species, owner_id, limit, offset } = req.query;

        // Базовый запрос
        let query = db('pets')
            .leftJoin('clients', 'pets.owner_id', 'clients.id')
            .select(
                'pets.*',
                'clients.first_name as owner_first_name',
                'clients.last_name as owner_last_name'
            );

        // Применение фильтров
        if (name) {
            query = query.whereRaw('LOWER(pets.name) LIKE ?', [`%${name.toLowerCase()}%`]);
        }

        if (species) {
            query = query.where('pets.species', species);
        }

        if (owner_id) {
            query = query.where('pets.owner_id', owner_id);
        }

        // Сортировка
        query = query.orderBy('pets.name', 'asc');

        // Пагинация
        if (limit) {
            query = query.limit(parseInt(limit));

            if (offset) {
                query = query.offset(parseInt(offset));
            }
        }

        // Выполнение запроса
        const pets = await query;

        res.json(pets);
    } catch (err) {
        logger.error(`Ошибка при получении списка питомцев: ${err.message}`);
        res.status(500).json({ error: 'Ошибка при получении списка питомцев' });
    }
};

/**
 * Получение конкретного питомца
 */
exports.getOne = async (req, res) => {
    try {
        const pet = await db('pets')
            .leftJoin('clients', 'pets.owner_id', 'clients.id')
            .select(
                'pets.*',
                'clients.first_name as owner_first_name',
                'clients.last_name as owner_last_name',
                'clients.phone as owner_phone',
                'clients.email as owner_email'
            )
            .where('pets.id', req.params.id)
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

/**
 * Создание нового питомца
 */
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

        // Проверка существования владельца
        if (owner_id) {
            const owner = await db('clients')
                .where('id', owner_id)
                .first();

            if (!owner) {
                return res.status(400).json({ error: 'Указанный владелец не найден' });
            }
        }

        // Создание питомца
        const [id] = await db('pets').insert({
            name,
            species,
            breed,
            age: age || null,
            gender: gender || null,
            weight: weight || null,
            description,
            photo,
            owner_id,
            created_at: new Date(),
            updated_at: new Date()
        }, 'id');

        const newPet = await db('pets')
            .where('id', id)
            .first();

        res.status(201).json(newPet);
    } catch (err) {
        logger.error(`Ошибка при создании питомца: ${err.message}`);
        res.status(500).json({ error: 'Ошибка при создании питомца' });
    }
};

/**
 * Обновление питомца
 */
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

        // Проверка существования питомца
        const pet = await db('pets')
            .where('id', id)
            .first();

        if (!pet) {
            return res.status(404).json({ error: 'Питомец не найден' });
        }

        // Проверка существования нового владельца, если указан
        if (owner_id && owner_id !== pet.owner_id) {
            const owner = await db('clients')
                .where('id', owner_id)
                .first();

            if (!owner) {
                return res.status(400).json({ error: 'Указанный владелец не найден' });
            }
        }

        // Обновление данных питомца
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
            .where('id', id)
            .update(updateData);

        const updatedPet = await db('pets')
            .where('id', id)
            .first();

        res.json(updatedPet);
    } catch (err) {
        logger.error(`Ошибка при обновлении питомца: ${err.message}`);
        res.status(500).json({ error: 'Ошибка при обновлении питомца' });
    }
};

/**
 * Удаление питомца
 */
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        // Проверка существования питомца
        const pet = await db('pets')
            .where('id', id)
            .first();

        if (!pet) {
            return res.status(404).json({ error: 'Питомец не найден' });
        }

        // Проверка наличия активных приемов
        const activeAppointments = await db('appointments')
            .where('pet_id', id)
            .where('status', 'scheduled')
            .first();

        if (activeAppointments) {
            return res.status(400).json({ error: 'Невозможно удалить питомца с активными приемами' });
        }

        // Удаление питомца
        await db('pets')
            .where('id', id)
            .del();

        res.json({ message: 'Питомец успешно удален' });
    } catch (err) {
        logger.error(`Ошибка при удалении питомца: ${err.message}`);
        res.status(500).json({ error: 'Ошибка при удалении питомца' });
    }
};

/**
 * Получение истории приемов питомца
 */
exports.getHistory = async (req, res) => {
    try {
        const { id } = req.params;

        // Проверка существования питомца
        const pet = await db('pets')
            .where('id', id)
            .first();

        if (!pet) {
            return res.status(404).json({ error: 'Питомец не найден' });
        }

        // Получение истории приемов
        const appointments = await db('appointments')
            .join('vets', 'appointments.vet_id', 'vets.id')
            .select(
                'appointments.*',
                'vets.first_name as vet_first_name',
                'vets.last_name as vet_last_name',
                'vets.specialization as vet_specialization'
            )
            .where('pet_id', id)
            .orderBy('appointment_date', 'desc');

        // Добавление медицинских записей к каждому приему
        for (let appointment of appointments) {
            const records = await db('medical_records')
                .where('appointment_id', appointment.id)
                .orderBy('created_at', 'asc');

            appointment.medical_records = records;
        }

        res.json(appointments);
    } catch (err) {
        logger.error(`Ошибка при получении истории приемов питомца: ${err.message}`);
        res.status(500).json({ error: 'Ошибка при получении истории приемов питомца' });
    }
}; 