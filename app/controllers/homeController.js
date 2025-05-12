const db = require('../config/database');
const logger = require('../utils/logger');

/**
 * Главная страница сайта
 */
exports.renderHomePage = async (req, res) => {
    try {
        const settings = await db('settings').first();

        // const featuredVets = await db('vets')
        //     .select('id', 'first_name', 'last_name', 'specialization', 'photo', 'bio')
        //     .where('is_featured', true)
        //     .limit(3);

        // // Получаем последние новости
        // const latestNews = await db('news')
        //     .select('id', 'title', 'content', 'image', 'created_at')
        //     .where('is_published', true)
        //     .orderBy('created_at', 'desc')
        //     .limit(3);

        // Подсчет общего количества питомцев, клиентов и проведенных приемов
        const petCount = await db('pets').count('petid as count').first();
        const clientCount = await db('users').where({ role: 'Client' }).count('userid as count').first();
        const appointmentCount = await db('appointments')
            .where('status', 'completed')
            .count('appointmentid as count')
            .first();

        res.render('pages/index', {
            title: settings?.clinic_name || 'Ветеринарная клиника',
            settings,
            // featuredVets,
            // latestNews,
            stats: {
                petCount: petCount.count,
                clientCount: clientCount.count,
                appointmentCount: appointmentCount.count
            },
            user: req.user
        });
    } catch (err) {
        logger.error(`Ошибка при загрузке главной страницы: ${err.message}`);
        res.status(500).render('pages/error', {
            title: 'Ошибка',
            message: 'Ошибка при загрузке главной страницы',
            error: process.env.NODE_ENV !== 'production' ? err : {}
        });
    }
};

/**
 * Страница услуг
 */
exports.renderServicesPage = async (req, res) => {
    try {
        const services = await db('services')
            .select('id', 'name', 'description', 'price', 'image', 'category')
            .orderBy('category')
            .orderBy('name');

        // Группировка услуг по категориям
        const servicesByCategory = {};
        services.forEach(service => {
            if (!servicesByCategory[service.category]) {
                servicesByCategory[service.category] = [];
            }
            servicesByCategory[service.category].push(service);
        });

        res.render('pages/services', {
            title: 'Услуги',
            servicesByCategory
        });
    } catch (err) {
        logger.error(`Ошибка при загрузке страницы услуг: ${err.message}`);
        res.status(500).render('pages/error', {
            title: 'Ошибка',
            message: 'Ошибка при загрузке страницы',
            error: process.env.NODE_ENV !== 'production' ? err : {}
        });
    }
};

/**
 * Страница контактов
 */
exports.renderContactsPage = async (req, res) => {
    try {
        const settings = await db('settings').first();

        res.render('pages/contacts', {
            title: 'Контакты',
            settings: settings || {}
        });
    } catch (err) {
        logger.error(`Ошибка при загрузке страницы контактов: ${err.message}`);
        res.render('pages/contacts', {
            title: 'Контакты',
            settings: {}
        });
    }
};

/**
 * Страница "О нас"
 */
exports.renderAboutPage = async (req, res) => {
    try {
        const settings = await db('settings').first();

        // Получение информации о команде
        const teamMembers = await db('team_members')
            .select('name', 'position', 'bio', 'photo')
            .orderBy('position')
            .orderBy('name');

        // Получение отзывов
        const testimonials = await db('testimonials')
            .select('name', 'text', 'rating', 'created_at')
            .where('is_approved', true)
            .orderBy('created_at', 'desc')
            .limit(5);

        res.render('pages/about', {
            title: 'О нас',
            settings: settings || {},
            teamMembers,
            testimonials
        });
    } catch (err) {
        logger.error(`Ошибка при загрузке страницы О нас: ${err.message}`);
        res.status(500).render('pages/error', {
            title: 'Ошибка',
            message: 'Ошибка при загрузке страницы',
            error: process.env.NODE_ENV !== 'production' ? err : {}
        });
    }
};

/**
 * Страница ветеринаров
 */
exports.renderVetsPage = async (req, res) => {
    try {
        // Получаем список активных ветеринаров
        let vetsQuery = db('users')
            .select('userid', 'name', 'email', 'specialization')
            .where('role', 'Vet');

        // Проверяем на наличие бана
        const activatedVetsIds = await db.select('users.userid')
            .from('users')
            .leftJoin('user_bans', function () {
                this.on('users.userid', '=', 'user_bans.userid')
                    .andOn(function () {
                        this.whereNull('user_bans.expires_at')
                            .orWhere('user_bans.expires_at', '>', db.fn.now());
                    });
            })
            .where('users.role', 'Vet')
            .whereNull('user_bans.id')
            .pluck('users.userid');

        vetsQuery = vetsQuery.whereIn('userid', activatedVetsIds);

        const vets = await vetsQuery.orderBy('name', 'asc');

        res.render('pages/vets', {
            title: 'Наши ветеринары',
            vets
        });
    } catch (err) {
        logger.error(`Ошибка при загрузке страницы ветеринаров: ${err.message}`);
        res.render('pages/vets', {
            title: 'Наши ветеринары',
            vets: []
        });
    }
};

/**
 * Страница записи на прием
 */
exports.renderAppointmentPage = async (req, res) => {
    try {
        // Получаем активных (не забаненных) ветеринаров
        const activatedVetsIds = await db.select('users.userid')
            .from('users')
            .leftJoin('user_bans', function () {
                this.on('users.userid', '=', 'user_bans.userid')
                    .andOn(function () {
                        this.whereNull('user_bans.expires_at')
                            .orWhere('user_bans.expires_at', '>', db.fn.now());
                    });
            })
            .where('users.role', 'Vet')
            .whereNull('user_bans.id')
            .pluck('users.userid');

        // Получение списка активных ветеринаров
        const vets = await db('users')
            .select('userid', 'name', 'specialization')
            .where('role', 'Vet')
            .whereIn('userid', activatedVetsIds)
            .orderBy('name', 'asc');

        // Получаем настройки для рабочих часов
        const settings = await db('settings').first();

        // Получаем данные формы и ошибки из параметров запроса
        let formData = {};
        if (req.query.formData) {
            try {
                formData = JSON.parse(decodeURIComponent(req.query.formData));
            } catch (e) {
                logger.error(`Ошибка декодирования данных формы: ${e.message}`);
            }
        }

        let error = null;
        if (req.query.error) {
            error = decodeURIComponent(req.query.error);
        }

        res.render('pages/appointment', {
            title: 'Запись на прием',
            vets,
            settings: settings || {},
            formData,
            error
        });
    } catch (err) {
        logger.error(`Ошибка при загрузке страницы записи: ${err.message}`);
        res.render('pages/appointment', {
            title: 'Запись на прием',
            vets: [],
            settings: {},
            formData: {}
        });
    }
};

/**
 * Страница благодарности после записи
 */
exports.renderThankYouPage = (req, res) => {
    res.render('pages/thank-you', {
        title: 'Спасибо за запись'
    });
}; 