const db = require('../db/database');
const logger = require('../utils/logger');
exports.renderHomePage = async (req, res) => {
    try {
        const settings = await db('settings').first();
        const petCount = await db('pets').count('petid as count').first();
        const clientCount = await db('users').where({ role: 'Client' }).count('userid as count').first();
        const appointmentCount = await db('appointments')
            .where('status', 'completed')
            .count('appointmentid as count')
            .first();
        res.render('pages/index', {
            title: settings?.clinic_name || 'Ветеринарная клиника',
            settings,
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
exports.renderServicesPage = async (req, res) => {
    try {
        const services = await db('services')
            .select('id', 'name', 'description', 'price', 'image', 'category')
            .orderBy('category')
            .orderBy('name');
        const servicesByCategory = {};
        services.forEach(service => {
            if (!servicesByCategory[service.category]) {
                servicesByCategory[service.category] = [];
            }
            servicesByCategory[service.category].push(service);
        });
        logger.info(servicesByCategory);
        res.render('pages/services', {
            title: 'Услуги',
            services
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
exports.renderAboutPage = async (req, res) => {
    try {
        const settings = await db('settings').first();
        const teamMembers = await db('team_members')
            .select('name', 'position', 'bio', 'photo')
            .orderBy('position')
            .orderBy('name');
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
exports.renderVetsPage = async (req, res) => {
    try {
        let vetsQuery = db('users')
            .select('userid', 'name', 'email', 'avatar')
            .where('role', 'Vet');
        let activatedVetsIds = await db('users').select('users.userid').where('users.role', 'Vet').leftJoin('user_bans', 'users.userid', '=', 'user_bans.userid').pluck('users.userid');
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
exports.renderAppointmentPage = async (req, res) => {
    try {
        const vets = await db('users')
            .select('userid', 'name', 'email')
            .where('role', 'Vet')
            .orderBy('name', 'asc');
        const settings = await db('settings').first();
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
exports.renderThankYouPage = (req, res) => {
    res.render('pages/thank-you', {
        title: 'Спасибо за запись'
    });
}; 