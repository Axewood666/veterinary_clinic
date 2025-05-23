const db = require('../db/database');
const logger = require('../utils/logger');

/**
 * Отображение страницы дашборда
 */
exports.renderDashboard = async (req, res) => {
    try {
        const stats = await this.getDashboardStats(req, res);

        res.render('pages/admin/dashboard', {
            title: 'Панель управления',
            activePage: 'dashboard',
            user: req.user,
            stats: stats
        });
    } catch (err) {
        logger.error(`Ошибка при загрузке дашборда: ${err.message}`);

        res.render('pages/admin/dashboard', {
            title: 'Панель управления',
            activePage: 'dashboard',
            user: req.user,
            stats: {}
        });
    }
};

exports.renderInvite = (req, res) => {
    res.render('pages/auth/invite', {
        title: 'Приглашение сотрудника',
        activePage: 'invite'
    });
};

/**
 * Получение статистики для дашборда
 */
exports.getDashboardStats = async (req, res) => {
    try {
        // Общее количество клиентов
        const clientsCount = await db('users').where('role', 'Client').count('userid as count').first();

        // Общее количество ветеринаров
        const vetsCount = await db('users').where('role', 'Vet').count('userid as count').first();

        // Общее количество менеджеров
        const managersCount = await db('users').where('role', 'Manager').count('userid as count').first();

        // Количество активных приглашений
        const invitationsCount = await db('invitation_tokens')
            .where('used', false)
            .where('expires_at', '>', db.fn.now())
            .count('id as count')
            .first();

        // Количество питомцев
        const petsCount = await db('pets').count('petid as count').first();

        // Количество приемов на сегодня
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        // Количество приемов всего
        const appointmentsCount = await db('appointments').where('status', 'completed').count('appointmentid as count').first();

        // Количество приемов на сегодня
        const todayAppointments = await db('appointments')
            .where('date', '>=', today)
            .andWhere('date', '<', tomorrow)
            .count('appointmentid as count')
            .first();

        // Получение статистики приемов по статусам
        const appointmentsByStatus = await db('appointments')
            .select('status')
            .count('appointmentid as count')
            .groupBy('status');

        // Преобразуем в удобный формат для фронтенда
        const statusCounts = {};
        appointmentsByStatus.forEach(item => {
            statusCounts[item.status] = item.count;
        });

        // Получение статистики приемов по месяцам за последний год
        const lastYear = new Date();
        lastYear.setFullYear(lastYear.getFullYear() - 1);

        const appointmentsByMonth = await db('appointments')
            .select(db.raw('EXTRACT(MONTH FROM date) as month'))
            .select(db.raw('EXTRACT(YEAR FROM date) as year'))
            .count('appointmentid as count')
            .where('date', '>=', lastYear)
            .groupBy('month', 'year')
            .orderBy('year', 'asc')
            .orderBy('month', 'asc');

        // Формируем ответ
        const stats = {
            clients: {
                total: clientsCount.count,
            },
            vets: {
                total: vetsCount.count,
            },
            managers: {
                total: managersCount.count,
            },
            invitations: {
                total: invitationsCount.count,
            },
            pets: {
                total: petsCount.count,
            },
            appointments: {
                total: appointmentsCount.count,
                today: todayAppointments.count,
                byStatus: statusCounts,
                byMonth: appointmentsByMonth
            }
        };

        if (res && req.originalUrl.startsWith('/api')) {
            return res.json(stats);
        }

        return stats;
    } catch (err) {
        logger.error(`Ошибка при получении статистики: ${err.message}`);
        if (res && req.originalUrl.startsWith('/api')) {
            return res.status(500).json({ error: 'Не удалось получить статистику' });
        }
        throw err;
    }
};

/**
 * Отображение страницы клиентов
 */
exports.renderClients = async (req, res) => {
    try {
        const clients = await db('users')
            .select('userid', 'username', 'email', 'name', 'role', 'avatar')
            .where('role', 'Client')
            .orderBy('name', 'asc');
        console.log(clients);
        res.render('pages/employee/clients', {
            title: 'Управление клиентами',
            activePage: 'clients',
            user: req.user,
            clients
        });
    } catch (err) {
        logger.error(`Ошибка при получении списка клиентов: ${err.message}`);

        res.render('pages/employee/clients', {
            title: 'Управление клиентами',
            activePage: 'clients',
            user: req.user,
            clients: []
        });
    }
};

exports.getClientDetails = async (req, res) => {
    try {
        const clientId = req.params.id;
        const client = await db('users')
            .select('userid', 'name', 'email', 'phoneNumber', 'role', 'avatar', 'username')
            .where('userid', clientId)
            .first();

        if (!client) {
            return res.status(404).json({ error: 'Клиент не найден' });
        }

        const pets = await db('pets')
            .select('petid', 'name', 'breed', 'age', 'gender', 'medicalhistory', 'type')
            .where('userid', clientId)
            .orderBy('name', 'asc');

        return res.json({ client, pets });
    } catch (err) {
        logger.error(`Ошибка при получении данных клиента: ${err.message}`);
    }
};

/**
 * Отображение страницы ветеринаров
 */
exports.renderVets = async (req, res) => {
    try {
        const vets = await db('users')
            .select('userid', 'name', 'email', 'phoneNumber', 'role', 'avatar')
            .where('role', 'Vet')
            .orderBy('name', 'asc');

        const invitations = await db('invitation_tokens')
            .select('*')
            .where('role', 'Vet')
            .where('used', false)
            .where('expires_at', '>', db.fn.now())
            .orderBy('created_at', 'desc');

        res.render('pages/admin/vets', {
            title: 'Управление ветеринарами',
            activePage: 'vets',
            user: req.user,
            vets,
            invitations
        });
    } catch (err) {
        logger.error(`Ошибка при получении списка ветеринаров: ${err.message}`);

        res.render('pages/admin/vets', {
            title: 'Управление ветеринарами',
            activePage: 'vets',
            user: req.user,
            vets: []
        });
    }
};

/**
 * Отображение формы для добавления ветеринара
 */
exports.renderNewVetForm = (req, res) => {
    res.render('admin/vets/form', {
        title: 'Добавление ветеринара',
        activePage: 'vets',
        vet: {},
        isNew: true
    });
};

/**
 * Отображение формы для редактирования ветеринара
 */
exports.renderEditVetForm = async (req, res) => {
    try {
        const vet = await db('vets')
            .select('*')
            .where('id', req.params.id)
            .first();

        if (!vet) {

            return res.redirect('/admin/vets');
        }

        res.render('admin/vets/form', {
            title: 'Редактирование ветеринара',
            activePage: 'vets',
            vet,
            isNew: false
        });
    } catch (err) {
        logger.error(`Ошибка при получении данных ветеринара: ${err.message}`);

        res.redirect('/admin/vets');
    }
};

/**
 * Отображение страницы приемов
 */
exports.renderAppointments = async (req, res) => {
    try {
        // Получение параметров фильтрации
        const { date, status, vetId } = req.query;

        // Базовый запрос
        let query = db('appointments')
            .join('pets', 'appointments.petid', 'pets.petid')
            .join('users', 'appointments.vetid', 'users.userid')
            .select(
                'appointments.*',
                'pets.name as petName',
                'pets.type as petType',
                'users.name as vetName',
                'users.username as vetUsername'
            );

        // Применение фильтров
        if (date) {
            const filterDate = new Date(date);
            const nextDay = new Date(filterDate);
            nextDay.setDate(nextDay.getDate() + 1);

            query = query
                .where('date', '>=', filterDate)
                .andWhere('date', '<', nextDay);
        }

        if (status) {
            query = query.where('appointments.status', status);
        }

        if (vetId) {
            query = query.where('appointments.vetid', vetId);
        }

        // Получение списка
        const appointments = await query.orderBy('date', 'desc');

        // Получение списка ветеринаров для фильтра
        const vets = await db('users')
            .select('userid', 'name', 'username')
            .where('role', 'Vet')
            .orderBy('name', 'asc');

        res.render('pages/employee/appointments', {
            title: 'Управление приемами',
            activePage: 'appointments',
            appointments,
            vets,
            user: req.user,
            filters: { date, status, vetId }
        });
    } catch (err) {
        logger.error(`Ошибка при получении списка приемов: ${err.message}`);

        res.render('pages/employee/appointments', {
            title: 'Управление приемами',
            activePage: 'appointments',
            appointments: [],
            vets: [],
            user: req.user,
            filters: {}
        });
    }
};

/**
 * Отображение деталей приема
 */
exports.renderAppointmentDetails = async (req, res) => {
    try {
        const appointment = await db('appointments')
            .join('pets', 'appointments.pet_id', 'pets.id')
            .join('vets', 'appointments.vetId', 'vets.id')
            .leftJoin('clients', 'pets.owner_id', 'clients.id')
            .select(
                'appointments.*',
                'pets.name as pet_name',
                'pets.species as pet_species',
                'pets.breed as pet_breed',
                'pets.age as pet_age',
                'vets.first_name as vet_first_name',
                'vets.last_name as vet_last_name',
                'clients.first_name as owner_first_name',
                'clients.last_name as owner_last_name',
                'clients.phone as owner_phone',
                'clients.email as owner_email'
            )
            .where('appointments.id', req.params.id)
            .first();

        if (!appointment) {

            return res.redirect('/admin/appointments');
        }

        res.render('admin/appointments/details', {
            title: 'Детали приема',
            activePage: 'appointments',
            appointment
        });
    } catch (err) {
        logger.error(`Ошибка при получении данных приема: ${err.message}`);

        res.redirect('/admin/appointments');
    }
};

/**
 * Отображение страницы питомцев
 */
exports.renderPets = async (req, res) => {
    try {
        // Получение параметров фильтрации
        const { name, type, ownerId } = req.query;

        // Базовый запрос
        let query = db('pets')
            .leftJoin('users', 'pets.userid', 'users.userid')
            .select(
                'pets.*',
                'users.name as ownerName',
                'users.username as ownerUsername'
            );

        // Применение фильтров
        if (name) {
            query = query.whereRaw('LOWER(pets.name) LIKE ?', [`%${name.toLowerCase()}%`]);
        }

        if (type) {
            query = query.where('pets.type', type);
        }

        if (ownerId) {
            query = query.where('pets.userid', ownerId);
        }

        // Получение списка
        const pets = await query.orderBy('pets.name', 'asc');

        // Получение уникальных видов для фильтра
        const typeList = await db('pets')
            .distinct('type')
            .orderBy('type', 'asc');

        const clients = await db('users')
            .select('userid', 'name', 'username')
            .where('role', 'Client')
            .orderBy('name', 'asc');

        res.render('pages/employee/pets', {
            title: 'Управление питомцами',
            activePage: 'pets',
            pets,
            user: req.user,
            typeList: typeList.map(t => t.type),
            clients,
            filters: { name, type }
        });
    } catch (err) {
        logger.error(`Ошибка при получении списка питомцев: ${err.message}`);

        res.render('pages/employee/pets', {
            title: 'Управление питомцами',
            activePage: 'pets',
            pets: [],
            typeList: [],
            user: req.user,
            filters: {}
        });
    }
};

/**
 * Отображение деталей питомца
 */
exports.renderPetDetails = async (req, res) => {
    try {
        // Получение данных питомца
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

            return res.redirect('/admin/pets');
        }

        // Получение истории приемов
        const appointments = await db('appointments')
            .join('vets', 'appointments.vetId', 'vets.id')
            .select(
                'appointments.*',
                'vets.first_name as vet_first_name',
                'vets.last_name as vet_last_name'
            )
            .where('pet_id', pet.id)
            .orderBy('date', 'desc');

        res.render('admin/pets/details', {
            title: 'Детали питомца',
            activePage: 'pets',
            pet,
            appointments
        });
    } catch (err) {
        logger.error(`Ошибка при получении данных питомца: ${err.message}`);

        res.redirect('/admin/pets');
    }
};

/**
 * Отображение страницы менеджеров
 */
exports.renderManagers = async (req, res) => {
    try {
        const managers = await db('users')
            .select('userid', 'name', 'email', 'phoneNumber', 'role', 'avatar', 'username')
            .where('role', 'Manager')
            .orderBy('name', 'asc');

        const invitations = await db('invitation_tokens')
            .select('*')
            .where('role', 'Manager')
            .where('used', false)
            .where('expires_at', '>=', db.fn.now())
            .orderBy('created_at', 'desc');

        res.render('pages/admin/managers', {
            title: 'Управление менеджерами',
            activePage: 'managers',
            user: req.user,
            managers,
            invitations
        });
    } catch (err) {
        logger.error(`Ошибка при получении списка менеджеров: ${err.message}`);

        res.render('pages/admin/managers', {
            title: 'Управление менеджерами',
            activePage: 'managers',
            user: req.user,
            managers: [],
            invitations: []
        });
    }
};

/**
 * Получение детальной информации о менеджере
 */
exports.getManagerDetails = async (req, res) => {
    try {
        const managerId = req.params.id;
        const manager = await db('users')
            .select('userid', 'name', 'email', 'phoneNumber', 'role', 'avatar', 'username')
            .where('userid', managerId)
            .where('role', 'Manager')
            .first();

        if (!manager) {
            return res.status(404).render('pages/error', {
                title: 'Ошибка',
                message: 'Менеджер не найден',
                user: req.user
            });
        }

        // Получаем статистику по работе менеджера
        const appointmentsModified = 0;

        const stats = {
            appointmentsModified: appointmentsModified
        };

        res.render('pages/admin/manager-details', {
            title: 'Информация о менеджере',
            activePage: 'managers',
            user: req.user,
            manager,
            stats
        });
    } catch (err) {
        logger.error(`Ошибка при получении данных менеджера: ${err.message}`);
        res.status(500).render('pages/error', {
            title: 'Ошибка',
            message: 'Не удалось загрузить информацию о менеджере',
            user: req.user
        });
    }
};

/**
 * Отображение страницы настроек
 */
exports.renderSettings = async (req, res) => {
    try {
        const settings = await db('settings')
            .select('*')
            .first();

        res.render('pages/admin/settings', {
            title: 'Настройки клиники',
            activePage: 'settings',
            settings: settings || {}
        });
    } catch (err) {
        logger.error(`Ошибка при получении настроек: ${err.message}`);

        res.render('pages/admin/settings', {
            title: 'Настройки клиники',
            activePage: 'settings',
            settings: {}
        });
    }
};

/**
 * Получение настроек клиники
 */
exports.getSettings = async (req, res) => {
    try {
        const settings = await db('settings')
            .select('*')
            .first();

        res.json(settings || {});
    } catch (err) {
        logger.error(`Ошибка при получении настроек: ${err.message}`);
        res.status(500).json({ error: 'Не удалось получить настройки' });
    }
};

/**
 * Обновление настроек клиники
 */
exports.updateSettings = async (req, res) => {
    try {
        const {
            clinic_name,
            address,
            phone,
            email,
            working_hours,
            appointment_duration,
            website,
            logo_url
        } = req.body;

        // Проверка существования записи
        const exists = await db('settings').first();

        if (exists) {
            // Обновление существующих настроек
            await db('settings').update({
                clinic_name,
                address,
                phone,
                email,
                working_hours,
                appointment_duration,
                website,
                logo_url
            });
        } else {
            // Создание настроек
            await db('settings').insert({
                clinic_name,
                address,
                phone,
                email,
                working_hours,
                appointment_duration,
                website,
                logo_url
            });
        }

        if (req.originalUrl.startsWith('/api')) {
            return res.json({ message: 'Настройки успешно обновлены' });
        }

        res.addSuccess('Настройки успешно обновлены');
        res.redirect('/admin/settings');
    } catch (err) {
        logger.error(`Ошибка при обновлении настроек: ${err.message}`);

        if (req.originalUrl.startsWith('/api')) {
            return res.status(500).json({ error: 'Не удалось обновить настройки' });
        }


        res.redirect('/admin/settings');
    }
}; 