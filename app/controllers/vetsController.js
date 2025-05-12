const db = require('../config/database');
const logger = require('../utils/logger');
const bcrypt = require('bcrypt');

/**
 * Получение всех ветеринаров
 */
exports.getAll = async (req, res) => {
    try {
        const vets = await db('users')
            .select('userid', 'name', 'email', 'phoneNumber')
            .where('role', 'Vet')
            .orderBy('name', 'asc');

        res.json(vets);
    } catch (err) {
        logger.error(`Ошибка при получении списка ветеринаров: ${err.message}`);
        res.status(500).json({ error: 'Ошибка при получении списка ветеринаров' });
    }
};

/**
 * Получение конкретного ветеринара
 */
exports.getOne = async (req, res) => {
    try {
        const vet = await db('users')
            .select('*')
            .where('userid', req.params.id)
            .where('role', 'Vet')
            .first();

        if (!vet) {
            return res.status(404).json({ error: 'Ветеринар не найден' });
        }

        // Получаем расписание ветеринара
        const schedules = await db('vet_schedules')
            .where('vetid', vet.userid);

        // Объединяем данные
        const result = {
            ...vet,
            schedules
        };

        res.json(result);
    } catch (err) {
        logger.error(`Ошибка при получении данных ветеринара: ${err.message}`);
        res.status(500).json({ error: 'Ошибка при получении данных ветеринара' });
    }
};

/**
 * Создание нового ветеринара
 */
exports.create = async (req, res) => {
    try {
        const {
            name,
            email,
            phoneNumber,
            username,
            password
        } = req.body;

        // Проверка на существование пользователя с таким email
        if (email) {
            const existingUser = await db('users')
                .where('email', email)
                .first();

            if (existingUser) {
                return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
            }
        }

        // Проверка на существование пользователя с таким username
        if (username) {
            const existingUsername = await db('users')
                .where('username', username)
                .first();

            if (existingUsername) {
                return res.status(400).json({ error: 'Пользователь с таким username уже существует' });
            }
        }

        // Хешируем пароль
        const hashedPassword = await bcrypt.hash(password, 10);

        // Создание ветеринара
        const [userid] = await db('users').insert({
            name,
            email,
            phoneNumber,
            username,
            password: hashedPassword,
            role: 'Vet'
        }, 'userid');

        const newVet = await db('users')
            .where('userid', userid)
            .first();

        res.status(201).json(newVet);
    } catch (err) {
        logger.error(`Ошибка при создании ветеринара: ${err.message}`);
        res.status(500).json({ error: 'Ошибка при создании ветеринара' });
    }
};

/**
 * Обновление ветеринара
 */
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            email,
            phoneNumber
        } = req.body;

        // Проверка существования
        const vet = await db('users')
            .where('userid', id)
            .where('role', 'Vet')
            .first();

        if (!vet) {
            return res.status(404).json({ error: 'Ветеринар не найден' });
        }

        // Проверка на существование другого пользователя с таким email
        if (email && email !== vet.email) {
            const existingUser = await db('users')
                .where('email', email)
                .whereNot('userid', id)
                .first();

            if (existingUser) {
                return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
            }
        }

        // Обновление ветеринара
        const updateData = {};

        if (name) updateData.name = name;
        if (email) updateData.email = email;
        if (phoneNumber) updateData.phoneNumber = phoneNumber;

        await db('users')
            .where('userid', id)
            .update(updateData);

        const updatedVet = await db('users')
            .where('userid', id)
            .first();

        res.json(updatedVet);
    } catch (err) {
        logger.error(`Ошибка при обновлении ветеринара: ${err.message}`);
        res.status(500).json({ error: 'Ошибка при обновлении ветеринара' });
    }
};

/**
 * Удаление ветеринара
 */
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;

        // Проверка существования
        const vet = await db('users')
            .where('userid', id)
            .where('role', 'Vet')
            .first();

        if (!vet) {
            return res.status(404).json({ error: 'Ветеринар не найден' });
        }

        // Проверка наличия активных приемов
        const activeAppointments = await db('appointments')
            .where('vetid', id)
            .where('status', 'scheduled')
            .first();

        if (activeAppointments) {
            return res.status(400).json({ error: 'Невозможно удалить ветеринара с активными приемами' });
        }

        // Удаление расписания ветеринара
        await db('vet_schedules')
            .where('vetid', id)
            .del();

        // Удаление ветеринара
        await db('users')
            .where('userid', id)
            .del();

        res.json({ message: 'Ветеринар успешно удален' });
    } catch (err) {
        logger.error(`Ошибка при удалении ветеринара: ${err.message}`);
        res.status(500).json({ error: 'Ошибка при удалении ветеринара' });
    }
};

/**
 * Управление расписанием ветеринара
 */
exports.updateSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const { schedules } = req.body;

        // Проверка существования
        const vet = await db('users')
            .where('userid', id)
            .where('role', 'Vet')
            .first();

        if (!vet) {
            return res.status(404).json({ error: 'Ветеринар не найден' });
        }

        // Удаляем текущее расписание
        await db('vet_schedules')
            .where('vetid', id)
            .del();

        // Добавляем новое расписание
        if (schedules && schedules.length) {
            const schedulesToInsert = schedules.map(schedule => ({
                vetid: id,
                day: schedule.day,
                start_time: schedule.start_time,
                end_time: schedule.end_time,
                is_active: schedule.is_active !== undefined ? schedule.is_active : true
            }));

            await db('vet_schedules').insert(schedulesToInsert);
        }

        // Получаем обновленное расписание
        const updatedSchedules = await db('vet_schedules')
            .where('vetid', id);

        res.json({
            message: 'Расписание успешно обновлено',
            schedules: updatedSchedules
        });
    } catch (err) {
        logger.error(`Ошибка при обновлении расписания: ${err.message}`);
        res.status(500).json({ error: 'Ошибка при обновлении расписания' });
    }
};

/**
 * Получение приемов ветеринара
 */
exports.getAppointments = async (req, res) => {
    try {
        const { id } = req.params;
        const { date_from, date_to, status } = req.query;

        // Проверка существования
        const vet = await db('users')
            .where('userid', id)
            .where('role', 'Vet')
            .first();

        if (!vet) {
            return res.status(404).json({ error: 'Ветеринар не найден' });
        }

        // Базовый запрос
        let query = db('appointments')
            .join('pets', 'appointments.petid', 'pets.petid')
            .join('users as clients', 'pets.userid', 'clients.userid')
            .select(
                'appointments.*',
                'pets.name as pet_name',
                'pets.type as pet_type',
                'clients.name as client_name',
                'clients.phoneNumber as client_phone'
            )
            .where('appointments.vetid', id);

        // Применение фильтров
        if (date_from) {
            query = query.where('date', '>=', new Date(date_from));
        }

        if (date_to) {
            const endDate = new Date(date_to);
            endDate.setDate(endDate.getDate() + 1); // Включаем весь день
            query = query.where('date', '<', endDate);
        }

        if (status) {
            query = query.where('appointments.status', status);
        }

        // Сортировка по дате
        query = query.orderBy('date', 'desc').orderBy('time', 'asc');

        // Выполнение запроса
        const appointments = await query;

        res.json(appointments);
    } catch (err) {
        logger.error(`Ошибка при получении приемов ветеринара: ${err.message}`);
        res.status(500).json({ error: 'Ошибка при получении приемов ветеринара' });
    }
}; 