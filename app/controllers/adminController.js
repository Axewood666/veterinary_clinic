const db = require('../config/database');
const logger = require('../utils/logger');

/**
 * Отображение страницы дашборда
 */
exports.renderDashboard = async (req, res) => {
    try {
        const stats = await this.getDashboardStats(req, res);
        res.render('admin/dashboard', {
            title: 'Панель управления',
            activePage: 'dashboard',
            stats: stats
        });
    } catch (err) {
        logger.error(`Ошибка при загрузке дашборда: ${err.message}`);
        res.addError('Не удалось загрузить статистику.');
        res.render('admin/dashboard', {
            title: 'Панель управления',
            activePage: 'dashboard',
            stats: {}
        });
    }
};

/**
 * Получение статистики для дашборда
 */
exports.getDashboardStats = async (req, res) => {
    try {
        // Общее количество ветеринаров
        const vetsCount = await db('vets').count('id as count').first();

        // Количество активных ветеринаров
        const activeVetsCount = await db('vets').where('is_active', true).count('id as count').first();

        // Количество питомцев
        const petsCount = await db('pets').count('id as count').first();

        // Количество приемов на сегодня
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        const tomorrow = new Date(today);
        tomorrow.setDate(tomorrow.getDate() + 1);

        const todayAppointments = await db('appointments')
            .where('appointment_date', '>=', today)
            .andWhere('appointment_date', '<', tomorrow)
            .count('id as count')
            .first();

        // Получение статистики приемов по статусам
        const appointmentsByStatus = await db('appointments')
            .select('status')
            .count('id as count')
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
            .select(db.raw('EXTRACT(MONTH FROM appointment_date) as month'))
            .select(db.raw('EXTRACT(YEAR FROM appointment_date) as year'))
            .count('id as count')
            .where('appointment_date', '>=', lastYear)
            .groupBy('month', 'year')
            .orderBy('year', 'asc')
            .orderBy('month', 'asc');

        // Формируем ответ
        const stats = {
            vets: {
                total: vetsCount.count,
                active: activeVetsCount.count
            },
            pets: petsCount.count,
            appointments: {
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
 * Отображение страницы ветеринаров
 */
exports.renderVets = async (req, res) => {
    try {
        const vets = await db('vets')
            .select('*')
            .orderBy('last_name', 'asc');

        res.render('admin/vets/index', {
            title: 'Управление ветеринарами',
            activePage: 'vets',
            vets
        });
    } catch (err) {
        logger.error(`Ошибка при получении списка ветеринаров: ${err.message}`);
        res.addError('Ошибка при загрузке данных ветеринаров');
        res.render('admin/vets/index', {
            title: 'Управление ветеринарами',
            activePage: 'vets',
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
            res.addError('Ветеринар не найден');
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
        res.addError('Ошибка при загрузке данных ветеринара');
        res.redirect('/admin/vets');
    }
};

/**
 * Отображение страницы приемов
 */
exports.renderAppointments = async (req, res) => {
    try {
        // Получение параметров фильтрации
        const { date, status, vet_id } = req.query;

        // Базовый запрос
        let query = db('appointments')
            .join('pets', 'appointments.pet_id', 'pets.id')
            .join('vets', 'appointments.vet_id', 'vets.id')
            .select(
                'appointments.*',
                'pets.name as pet_name',
                'pets.species as pet_species',
                'vets.first_name as vet_first_name',
                'vets.last_name as vet_last_name'
            );

        // Применение фильтров
        if (date) {
            const filterDate = new Date(date);
            const nextDay = new Date(filterDate);
            nextDay.setDate(nextDay.getDate() + 1);

            query = query
                .where('appointment_date', '>=', filterDate)
                .andWhere('appointment_date', '<', nextDay);
        }

        if (status) {
            query = query.where('appointments.status', status);
        }

        if (vet_id) {
            query = query.where('appointments.vet_id', vet_id);
        }

        // Получение списка
        const appointments = await query.orderBy('appointment_date', 'desc');

        // Получение списка ветеринаров для фильтра
        const vets = await db('vets')
            .select('id', 'first_name', 'last_name')
            .where('is_active', true)
            .orderBy('last_name', 'asc');

        res.render('admin/appointments/index', {
            title: 'Управление приемами',
            activePage: 'appointments',
            appointments,
            vets,
            filters: { date, status, vet_id }
        });
    } catch (err) {
        logger.error(`Ошибка при получении списка приемов: ${err.message}`);
        res.addError('Ошибка при загрузке данных приемов');
        res.render('admin/appointments/index', {
            title: 'Управление приемами',
            activePage: 'appointments',
            appointments: [],
            vets: [],
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
            .join('vets', 'appointments.vet_id', 'vets.id')
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
            res.addError('Прием не найден');
            return res.redirect('/admin/appointments');
        }

        res.render('admin/appointments/details', {
            title: 'Детали приема',
            activePage: 'appointments',
            appointment
        });
    } catch (err) {
        logger.error(`Ошибка при получении данных приема: ${err.message}`);
        res.addError('Ошибка при загрузке данных приема');
        res.redirect('/admin/appointments');
    }
};

/**
 * Отображение страницы питомцев
 */
exports.renderPets = async (req, res) => {
    try {
        // Получение параметров фильтрации
        const { name, species } = req.query;

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

        // Получение списка
        const pets = await query.orderBy('pets.name', 'asc');

        // Получение уникальных видов для фильтра
        const speciesList = await db('pets')
            .distinct('species')
            .orderBy('species', 'asc');

        res.render('admin/pets/index', {
            title: 'Управление питомцами',
            activePage: 'pets',
            pets,
            speciesList: speciesList.map(s => s.species),
            filters: { name, species }
        });
    } catch (err) {
        logger.error(`Ошибка при получении списка питомцев: ${err.message}`);
        res.addError('Ошибка при загрузке данных питомцев');
        res.render('admin/pets/index', {
            title: 'Управление питомцами',
            activePage: 'pets',
            pets: [],
            speciesList: [],
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
            res.addError('Питомец не найден');
            return res.redirect('/admin/pets');
        }

        // Получение истории приемов
        const appointments = await db('appointments')
            .join('vets', 'appointments.vet_id', 'vets.id')
            .select(
                'appointments.*',
                'vets.first_name as vet_first_name',
                'vets.last_name as vet_last_name'
            )
            .where('pet_id', pet.id)
            .orderBy('appointment_date', 'desc');

        res.render('admin/pets/details', {
            title: 'Детали питомца',
            activePage: 'pets',
            pet,
            appointments
        });
    } catch (err) {
        logger.error(`Ошибка при получении данных питомца: ${err.message}`);
        res.addError('Ошибка при загрузке данных питомца');
        res.redirect('/admin/pets');
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

        res.render('admin/settings', {
            title: 'Настройки клиники',
            activePage: 'settings',
            settings: settings || {}
        });
    } catch (err) {
        logger.error(`Ошибка при получении настроек: ${err.message}`);
        res.addError('Ошибка при загрузке настроек');
        res.render('admin/settings', {
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
                logo_url,
                updated_at: new Date()
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
                logo_url,
                created_at: new Date(),
                updated_at: new Date()
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

        res.addError('Ошибка при обновлении настроек');
        res.redirect('/admin/settings');
    }
}; 