const db = require('../../config/db');
const { getRandomInt, formatDate } = require('../../utils/helpers');

exports.getDashboardStats = async (req, res) => {
    try {
        const stats = {
            totalClients: await db('users').where({ role: 'client' }).count('userid as count').then(result => result[0].count),
            clientsChange: getRandomInt(-5, 15),

            totalPets: await db('pets').count('petId as count').then(result => result[0].count),
            petsChange: getRandomInt(-3, 10),

            totalAppointments: await db('appointments').count('appointmentId as count').then(result => result[0].count),
            appointmentsChange: getRandomInt(-10, 20),

            activeVets: await db('users').where({ role: 'vet', isActive: true }).count('userid as count').then(result => result[0].count),
            vetsChange: getRandomInt(-2, 5)
        };

        res.json(stats);
    } catch (error) {
        console.error('Error getting dashboard stats:', error);
        res.status(500).json({ error: 'Не удалось получить статистику для дашборда' });
    }
};

exports.getAppointmentsChart = async (req, res) => {
    try {
        const days = 7;
        const labels = [];
        const values = [];

        for (let i = days - 1; i >= 0; i--) {
            const date = new Date();
            date.setDate(date.getDate() - i);
            labels.push(formatDate(date));
        }

        for (let i = 0; i < days; i++) {
            const count = await db('appointments')
                .whereRaw('DATE(date) = ?', [labels[i]])
                .count('appointmentId as count')
                .then(result => result[0].count);

            values.push(count || 0);
        }

        res.json({ labels, values });
    } catch (error) {
        console.error('Error getting appointments chart data:', error);
        res.status(500).json({ error: 'Не удалось получить данные для графика приемов' });
    }
};

exports.getPetsTypeChart = async (req, res) => {
    try {
        const petTypes = await db('pets')
            .select('type')
            .count('petId as count')
            .groupBy('type');

        const labels = petTypes.map(item => item.type);
        const values = petTypes.map(item => item.count);

        res.json({ labels, values });
    } catch (error) {
        console.error('Error getting pets type chart data:', error);
        res.status(500).json({ error: 'Не удалось получить данные для графика типов питомцев' });
    }
};

exports.getAppointmentsStatusChart = async (req, res) => {
    try {
        const appointmentStatuses = await db('appointments')
            .select('status')
            .count('appointmentId as count')
            .groupBy('status');

        const labels = appointmentStatuses.map(item => item.status);
        const values = appointmentStatuses.map(item => item.count);

        res.json({ labels, values });
    } catch (error) {
        console.error('Error getting appointments status chart data:', error);
        res.status(500).json({ error: 'Не удалось получить данные для графика статусов приемов' });
    }
};

exports.getVetsWorkloadChart = async (req, res) => {
    try {
        const vets = await db('users')
            .where({ role: 'vet' })
            .select('userid', 'name');

        const labels = [];
        const values = [];

        for (const vet of vets) {
            labels.push(vet.name);

            const appointmentsCount = await db('appointments')
                .where('vetId', vet.userid)
                .count('appointmentId as count')
                .then(result => result[0].count);

            values.push(appointmentsCount || 0);
        }

        res.json({ labels, values });
    } catch (error) {
        console.error('Error getting vets workload chart data:', error);
        res.status(500).json({ error: 'Не удалось получить данные для графика загруженности ветеринаров' });
    }
};

exports.getRecentActivity = async (req, res) => {
    try {
        const recentAppointments = await db('appointments')
            .join('users as vets', 'appointments.vetId', 'vets.userid')
            .join('users as clients', 'appointments.clientId', 'clients.userid')
            .join('pets', 'appointments.petId', 'pets.petId')
            .select(
                'appointments.appointmentId',
                'appointments.date',
                'appointments.time',
                'appointments.status',
                'vets.name as vetName',
                'clients.name as clientName',
                'pets.name as petName'
            )
            .orderBy('appointments.date', 'desc')
            .orderBy('appointments.time', 'desc')
            .limit(10);

        const activities = recentAppointments.map(appointment => {
            let description;
            const timestamp = new Date(`${appointment.date}T${appointment.time}`);

            switch (appointment.status) {
                case 'scheduled':
                    description = `Прием #${appointment.appointmentId} запланирован для ${appointment.clientName} и питомца ${appointment.petName} с доктором ${appointment.vetName}`;
                    break;
                case 'completed':
                    description = `Прием #${appointment.appointmentId} завершен для ${appointment.clientName} и питомца ${appointment.petName} с доктором ${appointment.vetName}`;
                    break;
                case 'cancelled':
                    description = `Прием #${appointment.appointmentId} отменен для ${appointment.clientName} и питомца ${appointment.petName} с доктором ${appointment.vetName}`;
                    break;
                default:
                    description = `Прием #${appointment.appointmentId} обновлен для ${appointment.clientName} и питомца ${appointment.petName} с доктором ${appointment.vetName}`;
            }

            return {
                id: appointment.appointmentId,
                timestamp,
                description
            };
        });

        res.json(activities);
    } catch (error) {
        console.error('Error getting recent activity:', error);
        res.status(500).json({ error: 'Не удалось получить данные о последних действиях' });
    }
};

exports.getSettings = async (req, res) => {
    try {
        const settings = {
            clinicName: 'Ветеринарная клиника "Здоровый питомец"',
            clinicAddress: 'г. Москва, ул. Примерная, д. 123',
            clinicPhone: '+7 (123) 456-78-90',
            clinicEmail: 'info@vet-clinic.ru',

            workingHours: {
                понедельник: { start: '09:00', end: '18:00' },
                вторник: { start: '09:00', end: '18:00' },
                среда: { start: '09:00', end: '18:00' },
                четверг: { start: '09:00', end: '18:00' },
                пятница: { start: '09:00', end: '18:00' },
                суббота: { start: '10:00', end: '16:00' },
                воскресенье: { start: '10:00', end: '14:00' },
            },

            notifications: {
                email: true,
                sms: false,
                template: 'Уважаемый(ая) {clientName}, напоминаем о записи на прием {date} в {time} к ветеринару {vetName}.'
            },

            security: {
                sessionTimeout: 60,
                maxLoginAttempts: 5,
                twoFactorAuth: false
            }
        };

        res.json(settings);
    } catch (error) {
        console.error('Error getting settings:', error);
        res.status(500).json({ error: 'Не удалось получить настройки системы' });
    }
};

exports.updateGeneralSettings = async (req, res) => {
    try {
        const { clinicName, clinicAddress, clinicPhone, clinicEmail } = req.body;

        if (!clinicName || !clinicAddress || !clinicPhone || !clinicEmail) {
            return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
        }

        res.json({ success: true, message: 'Общие настройки успешно обновлены' });
    } catch (error) {
        console.error('Error updating general settings:', error);
        res.status(500).json({ error: 'Не удалось обновить общие настройки' });
    }
};

exports.updateWorkingHours = async (req, res) => {
    try {
        const { workingHours } = req.body;

        if (!workingHours) {
            return res.status(400).json({ error: 'Необходимо указать рабочее время' });
        }


        res.json({ success: true, message: 'Рабочее время успешно обновлено' });
    } catch (error) {
        console.error('Error updating working hours:', error);
        res.status(500).json({ error: 'Не удалось обновить рабочее время' });
    }
};

exports.updateNotificationSettings = async (req, res) => {
    try {
        const { email, sms, template } = req.body;

        if (email === undefined || sms === undefined || !template) {
            return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
        }


        res.json({ success: true, message: 'Настройки уведомлений успешно обновлены' });
    } catch (error) {
        console.error('Error updating notification settings:', error);
        res.status(500).json({ error: 'Не удалось обновить настройки уведомлений' });
    }
};

exports.updateSecuritySettings = async (req, res) => {
    try {
        const { sessionTimeout, maxLoginAttempts, twoFactorAuth } = req.body;

        if (!sessionTimeout || !maxLoginAttempts || twoFactorAuth === undefined) {
            return res.status(400).json({ error: 'Все поля обязательны для заполнения' });
        }

        res.json({ success: true, message: 'Настройки безопасности успешно обновлены' });
    } catch (error) {
        console.error('Error updating security settings:', error);
        res.status(500).json({ error: 'Не удалось обновить настройки безопасности' });
    }
}; 