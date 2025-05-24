const db = require('../db/database');
const logger = require('../utils/logger');
const bcrypt = require('bcrypt');
const knex = require('knex')(require('../../knexfile')[process.env.NODE_ENV || 'development']);
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
exports.getOne = async (req, res) => {
    try {
        const vet = await db('users')
            .select('userid', 'name', 'email', 'phoneNumber', 'role', 'avatar')
            .where('userid', req.params.id)
            .where('role', 'Vet')
            .first();
        if (!vet) {
            return res.status(404).json({ error: 'Ветеринар не найден' });
        }
        const schedules = await db('vet_schedules')
            .where('vetid', vet.userid);
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
exports.create = async (req, res) => {
    try {
        const {
            name,
            email,
            phoneNumber,
            username,
            password
        } = req.body;
        if (email) {
            const existingUser = await db('users')
                .where('email', email)
                .first();
            if (existingUser) {
                return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
            }
        }
        if (username) {
            const existingUsername = await db('users')
                .where('username', username)
                .first();
            if (existingUsername) {
                return res.status(400).json({ error: 'Пользователь с таким username уже существует' });
            }
        }
        const hashedPassword = await bcrypt.hash(password, 10);
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
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const {
            name,
            email,
            phoneNumber
        } = req.body;
        const vet = await db('users')
            .where('userid', id)
            .where('role', 'Vet')
            .first();
        if (!vet) {
            return res.status(404).json({ error: 'Ветеринар не найден' });
        }
        if (email && email !== vet.email) {
            const existingUser = await db('users')
                .where('email', email)
                .whereNot('userid', id)
                .first();
            if (existingUser) {
                return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
            }
        }
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
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const vet = await db('users')
            .where('userid', id)
            .where('role', 'Vet')
            .first();
        if (!vet) {
            return res.status(404).json({ error: 'Ветеринар не найден' });
        }
        const activeAppointments = await db('appointments')
            .where('vetid', id)
            .where('status', 'scheduled')
            .first();
        if (activeAppointments) {
            return res.status(400).json({ error: 'Невозможно удалить ветеринара с активными приемами' });
        }
        await db('vet_schedules')
            .where('vetid', id)
            .del();
        await db('users')
            .where('userid', id)
            .del();
        res.json({ message: 'Ветеринар успешно удален' });
    } catch (err) {
        logger.error(`Ошибка при удалении ветеринара: ${err.message}`);
        res.status(500).json({ error: 'Ошибка при удалении ветеринара' });
    }
};
exports.getSchedule = async (req, res) => {
    try {
        const { date } = req.query;
        if (!date) {
            return res.status(400).json({ error: 'Требуется параметр даты' });
        }
        if (date < new Date()) {
            return res.status(400).json({ error: 'Дата не может быть в прошлом' });
        }
        const selectedDate = new Date(date);
        const dayOfWeek = selectedDate.getDay();
        const dbDay = dayOfWeek === 0 ? '7' : String(dayOfWeek);
        const vets = await db('users')
            .join('vet_schedules', 'users.userid', 'vet_schedules.vetid')
            .select(
                'users.userid',
                'users.name',
                'vet_schedules.start_time',
                'vet_schedules.end_time'
            )
            .where('users.role', 'Vet')
            .where('vet_schedules.day', dbDay);
        const existingAppointments = await db('appointments')
            .select('vetid', 'time')
            .where('date', date)
            .whereNot('status', 'cancelled');
        const bookedSlots = {};
        existingAppointments.forEach(appointment => {
            if (!bookedSlots[appointment.vetid]) {
                bookedSlots[appointment.vetid] = [];
            }
            bookedSlots[appointment.vetid].push(appointment.time);
        });
        const result = [];
        const groupedVets = {};
        vets.forEach((vet, i) => {
            if (!groupedVets[vet.userid]) {
                groupedVets[vet.userid] = {
                    userid: vet.userid,
                    name: vet.name,
                    specialization: vet.specialization || 'Общая практика',
                    availableSlots: []
                };
            }
            const startTime = vet.start_time.split(':');
            const endTime = vet.end_time.split(':');
            const now = new Date();
            let startHour = parseInt(startTime[0]);
            if (now.getDate() === selectedDate.getDate() && i === 0 && startHour < now.getHours()) {
                startHour = now.getHours() + 1;
            }
            let startMinute = parseInt(startTime[1]);
            if (now.getDate() === selectedDate.getDate() && i === 0 && startMinute < now.getMinutes()) {
                startMinute = now.getMinutes() + 30;
            }
            const endHour = parseInt(endTime[0]);
            const endMinute = parseInt(endTime[1]);
            while (startHour < endHour || (startHour === endHour && startMinute < endMinute)) {
                const timeSlot = `${startHour.toString().padStart(2, '0')}:${startMinute.toString().padStart(2, '0')}`;
                if (!bookedSlots[vet.userid] || !bookedSlots[vet.userid].includes(timeSlot)) {
                    if (!groupedVets[vet.userid].availableSlots.includes(timeSlot)) {
                        groupedVets[vet.userid].availableSlots.push(timeSlot);
                    }
                }
                startMinute += 30;
                if (startMinute >= 60) {
                    startHour += 1;
                    startMinute = 0;
                }
            }
        });
        for (const key in groupedVets) {
            if (groupedVets[key].availableSlots.length > 0) {
                groupedVets[key].availableSlots.sort();
                result.push(groupedVets[key]);
            }
        }
        res.json(result);
    } catch (err) {
        logger.error(`Ошибка при получении расписания ветеринаров: ${err.message}`);
        res.status(500).json({ error: 'Ошибка при получении расписания ветеринаров' });
    }
};
exports.updateSchedule = async (req, res) => {
    try {
        const { id } = req.params;
        const { schedules } = req.body;
        const vet = await db('users')
            .where('userid', id)
            .where('role', 'Vet')
            .first();
        if (!vet) {
            return res.status(404).json({ error: 'Ветеринар не найден' });
        }
        await db('vet_schedules')
            .where('vetid', id)
            .del();
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
exports.getAppointments = async (req, res) => {
    try {
        const { id } = req.params;
        const { date_from, date_to, status } = req.query;
        const vet = await db('users')
            .where('userid', id)
            .where('role', 'Vet')
            .first();
        if (!vet) {
            return res.status(404).json({ error: 'Ветеринар не найден' });
        }
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
        if (date_from) {
            query = query.where('date', '>=', new Date(date_from));
        }
        if (date_to) {
            const endDate = new Date(date_to);
            endDate.setDate(endDate.getDate() + 1); 
            query = query.where('date', '<', endDate);
        }
        if (status) {
            query = query.where('appointments.status', status);
        }
        query = query.orderBy('date', 'desc').orderBy('time', 'asc');
        const appointments = await query;
        res.json(appointments);
    } catch (err) {
        logger.error(`Ошибка при получении приемов ветеринара: ${err.message}`);
        res.status(500).json({ error: 'Ошибка при получении приемов ветеринара' });
    }
}; 