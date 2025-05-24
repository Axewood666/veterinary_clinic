const db = require('../db/database');
const logger = require('../utils/logger');
const bcrypt = require('bcrypt');
exports.getAll = async (req, res) => {
    try {
        const { petid, vetid, date_from, date_to, status } = req.query;
        let query = db('appointments')
            .join('pets', 'appointments.petid', 'pets.petid')
            .join('users as vets', 'appointments.vetid', 'vets.userid')
            .join('users as clients', 'pets.userid', 'clients.userid')
            .select(
                'appointments.*',
                'pets.name as pet_name',
                'pets.type as pet_type',
                'vets.name as vet_name',
                'clients.name as client_name'
            );
        if (petid) {
            query = query.where('appointments.petid', petid);
        }
        if (vetid) {
            query = query.where('appointments.vetid', vetid);
        }
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
        query = query.orderBy('date', 'desc');
        const appointments = await query;
        res.json(appointments);
    } catch (err) {
        logger.error(`Ошибка при получении списка приемов: ${err.message}`);
        res.status(500).json({ error: 'Ошибка при получении списка приемов' });
    }
};
exports.getOne = async (req, res) => {
    try {
        const appointment = await db('appointments')
            .join('pets', 'appointments.petid', 'pets.petid')
            .join('users as vets', 'appointments.vetid', 'vets.userid')
            .join('users as clients', 'pets.userid', 'clients.userid')
            .select(
                'appointments.*',
                'pets.name as pet_name',
                'pets.type as pet_type',
                'pets.breed as pet_breed',
                'vets.name as vet_name',
                'clients.name as client_name',
                'clients.phoneNumber as client_phone',
                'clients.email as client_email'
            )
            .where('appointments.appointmentid', req.params.id)
            .first();
        if (!appointment) {
            return res.status(404).json({ error: 'Прием не найден' });
        }
        res.json(appointment);
    } catch (err) {
        logger.error(`Ошибка при получении данных приема: ${err.message}`);
        res.status(500).json({ error: 'Ошибка при получении данных приема' });
    }
};
exports.create = async (req, res) => {
    try {
        const { petid, vetid, date, time, type, comment } = req.body;
        const appointmentDate = new Date(date);
        const conflictingAppointment = await db('appointments')
            .where('vetid', vetid)
            .where('date', appointmentDate)
            .where('time', time)
            .where('status', '!=', 'cancelled')
            .first();
        if (conflictingAppointment) {
            return res.status(400).json({ error: 'Ветеринар недоступен в указанное время' });
        }
        const pet = await db('pets')
            .select('userid')
            .where('petid', petid)
            .first();
        if (!pet) {
            return res.status(404).json({ error: 'Питомец не найден' });
        }
        const [appointmentid] = await db('appointments').insert({
            petid,
            vetid,
            date: appointmentDate,
            time,
            type: type || 'consultation',
            comment,
            status: 'scheduled',
            clientId: pet.userid
        }, 'appointmentid');
        const newAppointment = await db('appointments')
            .where('appointmentid', appointmentid.appointmentid)
            .first();
        res.status(201).json(newAppointment);
    } catch (err) {
        logger.error(`Ошибка при создании приема: ${err.message}`);
        res.status(500).json({ error: 'Ошибка при создании приема' });
    }
};
exports.update = async (req, res) => {
    try {
        const { id } = req.params;
        const { status, comment, diagnosis, recomendations } = req.body;
        const appointment = await db('appointments')
            .where('appointmentid', id)
            .first();
        if (!appointment) {
            return res.status(404).json({ error: 'Прием не найден' });
        }
        const updateData = {};
        if (status) updateData.status = status;
        if (comment) updateData.comment = comment;
        if (diagnosis) updateData.diagnosis = diagnosis;
        if (recomendations) updateData.recomendations = recomendations;
        await db('appointments')
            .where('appointmentid', id)
            .update(updateData);
        const updatedAppointment = await db('appointments')
            .where('appointmentid', id)
            .first();
        res.json(updatedAppointment);
    } catch (err) {
        logger.error(`Ошибка при обновлении приема: ${err.message}`);
        res.status(500).json({ error: 'Ошибка при обновлении приема' });
    }
};
exports.delete = async (req, res) => {
    try {
        const { id } = req.params;
        const appointment = await db('appointments')
            .where('appointmentid', id)
            .first();
        if (!appointment) {
            return res.status(404).json({ error: 'Прием не найден' });
        }
        await db('appointments')
            .where('appointmentid', id)
            .del();
        res.json({ message: 'Прием успешно удален' });
    } catch (err) {
        logger.error(`Ошибка при удалении приема: ${err.message}`);
        res.status(500).json({ error: 'Ошибка при удалении приема' });
    }
};
exports.createAppointment = async (req, res) => {
    try {
        const {
            pet_name,
            pet_type,
            pet_age,
            pet_breed,
            pet_gender,
            owner_name,
            owner_phone,
            owner_email,
            vetid,
            date,
            time,
            comment,
            type
        } = req.body;
        if (!pet_name || !pet_type || !pet_age || !pet_breed || !pet_gender ||
            !owner_name || !owner_phone || !owner_email ||
            !vetid || !date || !time || !comment || !type) {
            const formData = encodeURIComponent(JSON.stringify(req.body));
            return res.redirect(`/appointment?error=Пожалуйста, заполните все обязательные поля&formData=${formData}`);
        }
        let userid;
        const existingUser = await db('users')
            .where('phoneNumber', owner_phone)
            .first();
        if (existingUser) {
            userid = existingUser.userid;
            await db('users')
                .where('userid', userid)
                .update({
                    name: owner_name,
                    email: owner_email || existingUser.email
                });
        } else {
            const password = Math.random().toString(36).substring(2, 10);
            const hashedPassword = await bcrypt.hash(password, 10);
            [userid] = await db('users').insert({
                username: owner_phone.replace(/[^\d]/g, ''),
                name: owner_name,
                email: owner_email,
                phoneNumber: owner_phone,
                role: 'Client',
                password: hashedPassword
            }, 'userid');
        }
        let petid;
        const existingPet = await db('pets')
            .where('userid', userid)
            .whereRaw('LOWER(name) = ?', [pet_name.toLowerCase()])
            .first();
        if (existingPet) {
            petid = existingPet.petid;
            await db('pets')
                .where('petid', petid)
                .update({
                    type: pet_type,
                    breed: pet_breed,
                    age: pet_age,
                    gender: pet_gender
                });
        } else {
            [petid] = await db('pets').insert({
                name: pet_name,
                type: pet_type,
                breed: pet_breed,
                age: pet_age,
                gender: pet_gender,
                userid,
                medicalhistory: ''
            }, 'petid');
        }
        const appointmentDate = new Date(date);
        const conflictingAppointment = await db('appointments')
            .where('vetid', vetid)
            .where('date', appointmentDate)
            .where('time', time)
            .where('status', '!=', 'cancelled')
            .first();
        if (conflictingAppointment) {
            const formData = encodeURIComponent(JSON.stringify(req.body));
            return res.redirect(`/appointment?error=Выбранное время уже занято. Пожалуйста, выберите другое время&formData=${formData}`);
        }
        await db('appointments').insert({
            petid,
            vetid,
            date: appointmentDate,
            time: time,
            type: type,
            status: 'scheduled',
            clientId: userid,
            comment: comment
        });
        res.redirect('/thank-you');
    } catch (err) {
        logger.error(`Ошибка при создании записи на прием: ${err.message}`);
        const formData = encodeURIComponent(JSON.stringify(req.body));
        res.redirect(`/appointment?error=Произошла ошибка при обработке вашей заявки. Пожалуйста, попробуйте еще раз&formData=${formData}`);
    }
}; 