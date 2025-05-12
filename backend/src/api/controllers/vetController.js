const { Users, VetSchedules, Appointments } = require('../models');

exports.getAllVets = async (req, res) => {
    try {
        const vets = await Users.getAllVets();
        res.json(vets);
    } catch (error) {
        console.error('Error getting all vets:', error);
        res.status(500).json({ error: 'Не удалось получить список ветеринаров' });
    }
};

exports.getVetSchedules = async (req, res) => {
    try {
        const schedules = await VetSchedules.getAllWithRelations();
        res.json(schedules);
    } catch (error) {
        console.error('Error getting vet schedules:', error);
        res.status(500).json({ error: 'Не удалось получить расписание ветеринаров' });
    }
};

exports.getVetScheduleById = async (req, res) => {
    try {
        const { vetid } = req.params;

        const schedule = await VetSchedules.getByVetId(vetid);
        if (!schedule) {
            return res.status(404).json({ error: 'Расписание не найдено' });
        }

        res.json(schedule);
    } catch (error) {
        console.error('Error getting vet schedule by id:', error);
        res.status(500).json({ error: 'Не удалось получить расписание ветеринара' });
    }
};

exports.getAvailableSlots = async (req, res) => {
    try {
        const { vetid } = req.params;
        const { date } = req.query;

        const schedule = await VetSchedules.getByVetId(vetid);
        if (!schedule) {
            return res.status(404).json({ error: 'Расписание не найдено' });
        }

        const bookedSlots = await Appointments.getAll()
            .where({ vetid, date })
            .select('time');

        const allSlots = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30',
            '12:00', '12:30', '13:00', '13:30', '14:00', '14:30',
            '15:00', '15:30', '16:00', '16:30', '17:00', '17:30'];

        const bookedSlotsArray = bookedSlots.map(slot => slot.time);
        const availableSlots = allSlots.filter(slot => !bookedSlotsArray.includes(slot));

        res.json({ availableSlots });
    } catch (error) {
        console.error('Error getting available slots:', error);
        res.status(500).json({ error: 'Не удалось получить доступные слоты' });
    }
};

exports.getVeterinarians = async (req, res) => {
    try {
        const vets = await Users.getActiveVets();
        res.json(vets);
    } catch (error) {
        console.error('Error getting veterinarians:', error);
        res.status(500).json({ error: 'Не удалось получить список ветеринаров' });
    }
};

exports.getVetById = async (req, res) => {
    try {
        const { id } = req.params;

        const vet = await Users.getVetById(id);
        if (!vet) {
            return res.status(404).json({ error: 'Ветеринар не найден' });
        }

        res.json(vet);
    } catch (error) {
        console.error('Error getting vet by id:', error);
        res.status(500).json({ error: 'Не удалось получить данные ветеринара' });
    }
};

exports.getVetAppointments = async (req, res) => {
    try {
        const { id } = req.params;

        const vet = await Users.getVetById(id);
        if (!vet) {
            return res.status(404).json({ error: 'Ветеринар не найден' });
        }

        const appointments = await Appointments.getAllWithRelations()
            .where('appointments.vetid', id)
            .orderBy('appointments.date', 'desc')
            .orderBy('appointments.time', 'desc');

        res.json(appointments);
    } catch (error) {
        console.error('Error getting vet appointments:', error);
        res.status(500).json({ error: 'Не удалось получить приемы ветеринара' });
    }
};

exports.toggleVetStatus = async (req, res) => {
    try {
        const { id } = req.params;

        const vet = await Users.getVetById(id);
        if (!vet) {
            return res.status(404).json({ error: 'Ветеринар не найден' });
        }

        const newStatus = !vet.isActive;
        const updatedVet = await Users.toggleVetStatus(id, newStatus);

        res.json({
            success: true,
            message: `Ветеринар ${newStatus ? 'активирован' : 'деактивирован'}`,
            vet: updatedVet[0]
        });
    } catch (error) {
        console.error('Error toggling vet status:', error);
        res.status(500).json({ error: 'Не удалось изменить статус ветеринара' });
    }
};

exports.createVet = async (req, res) => {
    try {
        const { name, email, password, phoneNumber, specialization } = req.body;

        if (!name || !email || !password) {
            return res.status(400).json({ error: 'Имя, email и пароль обязательны' });
        }

        // Проверяем, существует ли пользователь с такой почтой
        const existingUser = await Users.getAll().where({ email }).first();
        if (existingUser) {
            return res.status(400).json({ error: 'Пользователь с таким email уже существует' });
        }

        // Создаем нового ветеринара
        const vetData = {
            name,
            email,
            password,
            phoneNumber,
            specialization
        };

        const newVet = await Users.createVet(vetData);

        res.status(201).json({
            success: true,
            message: 'Ветеринар успешно создан',
            vet: {
                userid: newVet[0].userid,
                name: newVet[0].name,
                email: newVet[0].email,
                phoneNumber: newVet[0].phoneNumber,
                specialization: newVet[0].specialization,
                isActive: true
            }
        });
    } catch (error) {
        console.error('Error creating vet:', error);
        res.status(500).json({ error: 'Не удалось создать ветеринара' });
    }
};

// Обновление данных ветеринара (только для админа)
exports.updateVet = async (req, res) => {
    try {
        const { id } = req.params;
        const { name, email, phoneNumber, specialization } = req.body;

        // Проверяем, существует ли ветеринар
        const vet = await Users.getVetById(id);
        if (!vet) {
            return res.status(404).json({ error: 'Ветеринар не найден' });
        }

        // Подготавливаем данные для обновления
        const updateData = {
            name: name || vet.name,
            email: email || vet.email,
            phoneNumber: phoneNumber || vet.phoneNumber,
            specialization: specialization || vet.specialization
        };

        // Обновляем данные ветеринара
        const updatedVet = await Users.updateVet(id, updateData);

        res.json({
            success: true,
            message: 'Данные ветеринара успешно обновлены',
            vet: updatedVet[0]
        });
    } catch (error) {
        console.error('Error updating vet:', error);
        res.status(500).json({ error: 'Не удалось обновить данные ветеринара' });
    }
};
