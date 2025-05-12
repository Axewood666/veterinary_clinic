const { Users, Pets, Appointments, VetSchedules } = require('../models');
const _ = require('lodash');
const db = require('../../config/db');
const logger = require('../../utils/logger');
const APIError = require('../../utils/APIError');

exports.getAllAppointments = async (req, res, next) => {
    try {
        logger.debug('Получение списка всех приемов');

        const appointments = await db('appointments')
            .join('users as vets', 'appointments.vetId', 'vets.userid')
            .join('users as clients', 'appointments.clientId', 'clients.userid')
            .join('pets', 'appointments.petId', 'pets.petId')
            .select(
                'appointments.appointmentId',
                'appointments.date',
                'appointments.time',
                'appointments.status',
                'appointments.diagnosis',
                'appointments.recommendations',
                'vets.name as vetName',
                'clients.name as clientName',
                'pets.name as petName'
            )
            .orderBy('appointments.date', 'desc')
            .orderBy('appointments.time', 'desc');

        logger.info(`Получено ${appointments.length} приемов`);
        res.json(appointments);
    } catch (error) {
        logger.error('Ошибка при получении всех приемов:', error);
        next(APIError.internal('Не удалось получить список приемов', { originalError: error.message }));
    }
};

exports.filterAppointments = async (req, res, next) => {
    try {
        const { status, vetId, clientId, date } = req.query;

        logger.debug('Фильтрация приемов по параметрам:', { status, vetId, clientId, date });

        let query = db('appointments')
            .join('users as vets', 'appointments.vetId', 'vets.userid')
            .join('users as clients', 'appointments.clientId', 'clients.userid')
            .join('pets', 'appointments.petId', 'pets.petId')
            .select(
                'appointments.appointmentId',
                'appointments.date',
                'appointments.time',
                'appointments.status',
                'appointments.diagnosis',
                'appointments.recommendations',
                'vets.name as vetName',
                'clients.name as clientName',
                'pets.name as petName'
            );

        if (status) {
            query = query.where('appointments.status', status);
        }

        if (vetId) {
            query = query.where('appointments.vetId', vetId);
        }

        if (clientId) {
            query = query.where('appointments.clientId', clientId);
        }

        if (date) {
            query = query.where('appointments.date', date);
        }

        const appointments = await query
            .orderBy('appointments.date', 'desc')
            .orderBy('appointments.time', 'desc');

        logger.info(`Найдено ${appointments.length} приемов по фильтрам`);
        res.json(appointments);
    } catch (error) {
        logger.error('Ошибка при фильтрации приемов:', error);
        next(APIError.internal('Не удалось получить отфильтрованный список приемов', { originalError: error.message }));
    }
};

exports.getAppointmentById = async (req, res, next) => {
    try {
        const { id } = req.params;
        logger.debug(`Получение приема по ID: ${id}`);

        const appointment = await db('appointments')
            .join('users as vets', 'appointments.vetId', 'vets.userid')
            .join('users as clients', 'appointments.clientId', 'clients.userid')
            .join('pets', 'appointments.petId', 'pets.petId')
            .where('appointments.appointmentId', id)
            .select(
                'appointments.appointmentId',
                'appointments.date',
                'appointments.time',
                'appointments.status',
                'appointments.diagnosis',
                'appointments.recommendations',
                'appointments.comments',
                'vets.name as vetName',
                'vets.userid as vetId',
                'clients.name as clientName',
                'clients.userid as clientId',
                'pets.name as petName',
                'pets.petId as petId'
            )
            .first();

        if (!appointment) {
            logger.warn(`Прием с ID ${id} не найден`);
            throw APIError.notFound(`Прием с ID ${id} не найден`);
        }

        logger.info(`Получены данные приема #${id}`);
        res.json(appointment);
    } catch (error) {
        if (error instanceof APIError) {
            next(error);
        } else {
            logger.error(`Ошибка при получении приема по ID ${req.params.id}:`, error);
            next(APIError.internal('Не удалось получить данные приема', { originalError: error.message }));
        }
    }
};

// Метод для отмены приема
exports.cancelAppointment = async (req, res, next) => {
    try {
        const { id } = req.params;
        logger.debug(`Отмена приема #${id} пользователем ${req.user.userid}`);

        // Проверяем, существует ли прием
        const appointment = await db('appointments')
            .where('appointmentId', id)
            .first();

        if (!appointment) {
            logger.warn(`Попытка отменить несуществующий прием #${id}`);
            throw APIError.notFound(`Прием с ID ${id} не найден`);
        }

        // Проверяем, можно ли отменить прием
        if (appointment.status === 'completed') {
            logger.warn(`Попытка отменить завершенный прием #${id}`);
            throw APIError.badRequest('Нельзя отменить завершенный прием');
        }

        if (appointment.status === 'cancelled') {
            logger.warn(`Попытка отменить уже отмененный прием #${id}`);
            throw APIError.badRequest('Прием уже отменен');
        }

        // Обновляем статус приема
        await db('appointments')
            .where('appointmentId', id)
            .update({
                status: 'cancelled',
                cancelledAt: new Date(),
                cancelledBy: req.user.userid
            });

        logger.info(`Прием #${id} успешно отменен пользователем ${req.user.userid}`);
        res.json({
            success: true,
            message: 'Прием успешно отменен'
        });
    } catch (error) {
        if (error instanceof APIError) {
            next(error);
        } else {
            logger.error(`Ошибка при отмене приема #${req.params.id}:`, error);
            next(APIError.internal('Не удалось отменить прием', { originalError: error.message }));
        }
    }
};

// Метод для завершения приема
exports.completeAppointment = async (req, res, next) => {
    try {
        const { id } = req.params;
        const { diagnosis, recommendations } = req.body;

        logger.debug(`Завершение приема #${id} пользователем ${req.user.userid}`, {
            diagnosis: diagnosis ? 'указан' : 'не указан',
            recommendations: recommendations ? 'указаны' : 'не указаны'
        });

        // Проверяем, существует ли прием
        const appointment = await db('appointments')
            .where('appointmentId', id)
            .first();

        if (!appointment) {
            logger.warn(`Попытка завершить несуществующий прием #${id}`);
            throw APIError.notFound(`Прием с ID ${id} не найден`);
        }

        // Проверяем, можно ли завершить прием
        if (appointment.status === 'completed') {
            logger.warn(`Попытка завершить уже завершенный прием #${id}`);
            throw APIError.badRequest('Прием уже завершен');
        }

        if (appointment.status === 'cancelled') {
            logger.warn(`Попытка завершить отмененный прием #${id}`);
            throw APIError.badRequest('Нельзя завершить отмененный прием');
        }

        // Обновляем данные приема
        await db('appointments')
            .where('appointmentId', id)
            .update({
                status: 'completed',
                completedAt: new Date(),
                diagnosis: diagnosis || appointment.diagnosis,
                recommendations: recommendations || appointment.recommendations
            });

        logger.info(`Прием #${id} успешно завершен пользователем ${req.user.userid}`);
        res.json({
            success: true,
            message: 'Прием успешно завершен'
        });
    } catch (error) {
        if (error instanceof APIError) {
            next(error);
        } else {
            logger.error(`Ошибка при завершении приема #${req.params.id}:`, error);
            next(APIError.internal('Не удалось завершить прием', { originalError: error.message }));
        }
    }
};

exports.getAppointments = async (req, res, next) => {
    try {
        const userid = req.params.userid;
        const user = req.user;
        const status = req.query.status;

        logger.debug(`Получение приемов для пользователя ${userid}`, { status });

        if (user.role == 'Client' && user.userid != userid) {
            logger.warn(`Попытка пользователя ${user.userid} получить приемы другого клиента ${userid}`);
            throw APIError.forbidden('У вас нет прав на просмотр приемов этого клиента');
        }

        const client = await Users.getById(userid);
        if (_.isEmpty(client)) {
            logger.warn(`Клиент ${userid} не найден`);
            throw APIError.notFound('Клиент не найден');
        } else if (client.role != 'Client') {
            logger.warn(`Попытка получить приемы для не-клиента ${userid}`);
            throw APIError.badRequest('Действие доступно только для учетных записей клиентов');
        }

        const pets = await Pets.getAll().where({ userid });
        if (_.isEmpty(pets)) {
            logger.warn(`У клиента ${userid} нет питомцев`);
            throw APIError.notFound('У клиента нет питомцев');
        }

        let query = Appointments.getAllWithRelations()

        if (status) {
            query = query.where('appointments.status', status);
        }
        query = query.whereIn('appointments.petid', pets.map(item => item.petid));
        query = query.orderBy('appointments.date', 'asc');

        const appointments = await query;
        logger.info(`Получено ${appointments.length} приемов для клиента ${userid}`);
        res.status(200).json(appointments);
    } catch (error) {
        if (error instanceof APIError) {
            next(error);
        } else {
            logger.error(`Ошибка при получении приемов для пользователя ${req.params.userid}:`, error);
            next(APIError.internal('Не удалось получить список приемов', { originalError: error.message }));
        }
    }
};

exports.createAppointment = async (req, res) => {
    const { userid } = req.params;
    const { petid, date, comment, vetid, type } = req.body;

    try {
        if (!isValidDate(date)) {
            return res.status(400).json({ message: 'Date must be within the next 7 days' });
        }
        const validDate = new Date(date);

        const user = req.user;
        if (user.role === 'Client' && user.userid !== userid) {
            return res.status(403).json({ message: 'You are not authorized to perform this action' });
        }

        const client = await Users.getById(userid);
        if (_.isEmpty(client) || client.role !== 'Client') {
            return res.status(404).json({ message: 'Client not found or not authorized' });
        }

        const pet = await Pets.getById(petid);
        if (_.isEmpty(pet) || pet.userid !== userid) {
            return res.status(404).json({ message: 'Pet not found or not assigned to this client' });
        }

        const vet = await Users.getById(vetid);
        if (_.isEmpty(vet) || vet.role !== 'Vet') {
            return res.status(404).json({ message: 'Vet not found or not authorized' });
        }

        const availableSlots = await VetSchedules.getAvailableSlots(vet.userid, validDate);
        const slotTime = validDate.getHours() + ':' + (validDate.getMinutes() < 10 ? '0' + validDate.getMinutes() : validDate.getMinutes());
        const slot = availableSlots.find(slot => slot.start === slotTime);
        if (!slot) {
            return res.status(404).json({ message: 'No available slots' });
        }

        const appointment = await Appointments.create({
            petid,
            date,
            comment,
            vetid,
            type,
            status: 'scheduled'
        });

        if (_.isEmpty(appointment)) {
            return res.status(500).json({ message: 'Failed to create appointment' });
        }

        res.status(201).json(appointment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.acceptAppointment = async (req, res) => {
    try {
        const appointmentid = req.params.appointmentid;

        const appointment = await Appointments.getById(appointmentid);
        if (_.isEmpty(appointment)) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        if (appointment.status != 'scheduled') {
            return res.status(400).json({ message: 'Appointment is not scheduled' });
        }

        const updatedAppointment = await Appointments.update(appointmentid, { status: 'accepted' });
        if (_.isEmpty(updatedAppointment)) {
            return res.status(400).json({ message: 'Failed to accept appointment' });
        }

        res.status(200).json(updatedAppointment[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.deleteAppointment = async (req, res) => {
    try {
        const user = req.user;
        const userid = req.params.userid;

        if (user.role == 'Client' && user.userid != userid) {
            return res.status(403).json({ message: 'You are not allowed' });
        }

        await Appointments.delete(req.params.appointmentid);

        res.status(200).json({ message: 'Appointment deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.updateAppointment = async (req, res) => {
    try {
        const userid = req.params.userid;

        const { date, comment, diagnosis, type, status, recomendations } = req.body;

        if (!isValidDate(date)) {
            return res.status(400).json({ message: 'Date must be within the next 7 days' });
        }
        const validDate = new Date(date);

        const user = await Users.getById(userid);
        if (_.isEmpty(user)) {
            return res.status(404).json({ message: 'User not found' });
        } else if (user.role != 'Client') {
            return res.status(403).json({ message: 'This action is only allowed for clients accounts' });
        }

        const appointment = await Appointments.getById(req.params.appointmentid);
        if (_.isEmpty(appointment)) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        const newAppointment = await Appointments.update(req.params.appointmentid, { date: validDate, comment, diagnosis, type, status, recomendations });
        if (_.isEmpty(newAppointment)) {
            return res.status(400).json({ message: 'Failed to update appointment' });
        }

        res.status(200).json(newAppointment[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

function isValidDate(date) {
    const validDate = new Date(date);
    const currentDate = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(currentDate.getDate() + 7);

    if (isNaN(validDate.getTime()) || validDate < currentDate || validDate > sevenDaysFromNow) {
        return false;
    }
    return true;
}
