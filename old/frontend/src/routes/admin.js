const express = require('express');
const router = express.Router();
const { isAdmin } = require('../middlewares/authMiddleware');

router.use(isAdmin);

router.get('/dashboard', async (req, res) => {
    try {
        const stats = await fetch(`${process.env.BACKEND_URL}/api/admin/dashboard/stats`, {
            credentials: 'include'
        }).then(res => res.json());

        const appointmentsChart = await fetch(`${process.env.BACKEND_URL}/api/admin/dashboard/appointments-chart`, {
            credentials: 'include'
        }).then(res => res.json());

        const petsTypeChart = await fetch(`${process.env.BACKEND_URL}/api/admin/dashboard/pets-type-chart`, {
            credentials: 'include'
        }).then(res => res.json());

        const appointmentsStatusChart = await fetch(`${process.env.BACKEND_URL}/api/admin/dashboard/appointments-status-chart`, {
            credentials: 'include'
        }).then(res => res.json());

        const vetsWorkloadChart = await fetch(`${process.env.BACKEND_URL}/api/admin/dashboard/vets-workload-chart`, {
            credentials: 'include'
        }).then(res => res.json());

        const recentActivity = await fetch(`${process.env.BACKEND_URL}/api/admin/dashboard/recent-activity`, {
            credentials: 'include'
        }).then(res => res.json());

        res.render('pages/admin/dashboard', {
            activePage: 'dashboard',
            stats,
            appointmentsChart,
            petsTypeChart,
            appointmentsStatusChart,
            vetsWorkloadChart,
            recentActivity,
            backEndUrl: process.env.BACKEND_URL,
            user: req.user,
            notifications: req.notifications || [],
            notificationsCount: req.notificationsCount || 0
        });
    } catch (error) {
        console.error('Ошибка при загрузке дашборда:', error);
        res.status(500).render('pages/error', {
            title: 'Ошибка сервера',
            message: 'Ошибка при загрузке дашборда',
            error: error
        });
    }
});

router.get('/vets', async (req, res) => {
    try {
        const vets = await fetch(`${process.env.BACKEND_URL}/api/vets`, {
            credentials: 'include'
        }).then(res => res.json());

        res.render('pages/admin/vets', {
            activePage: 'vets',
            vets,
            backEndUrl: process.env.BACKEND_URL,
            user: req.user,
            notifications: req.notifications || [],
            notificationsCount: req.notificationsCount || 0
        });
    } catch (error) {
        console.error('Ошибка при загрузке списка ветеринаров:', error);
        res.status(500).render('pages/error', {
            title: 'Ошибка сервера',
            message: 'Ошибка при загрузке списка ветеринаров',
            error: error
        });
    }
});

// Клиенты
router.get('/clients', async (req, res) => {
    try {
        const response = await fetch(`${process.env.BACKEND_URL}/api/clients`, {
            headers: {
                'Cookie': req.headers.cookie || '',
                'Authorization': `Bearer ${req.cookies.token}`
            },
            credentials: 'include'
        });

        const clients = await response.json();

        res.render('pages/admin/clients', {
            activePage: 'clients',
            clients,
            backEndUrl: process.env.BACKEND_URL,
            user: req.user,
            notifications: req.notifications || [],
            notificationsCount: req.notificationsCount || 0
        });
    } catch (error) {
        console.error('Ошибка при загрузке списка клиентов:', error);
        res.status(500).render('pages/error', {
            title: 'Ошибка сервера',
            message: 'Ошибка при загрузке списка клиентов',
            error: error
        });
    }
});

// Питомцы
router.get('/pets', async (req, res) => {
    try {
        const pets = await fetch(`${process.env.BACKEND_URL}/api/pets`, {
            credentials: 'include'
        }).then(res => res.json());

        const clients = await fetch(`${process.env.BACKEND_URL}/api/clients`, {
            credentials: 'include'
        }).then(res => res.json());

        res.render('pages/admin/pets', {
            activePage: 'pets',
            pets,
            clients,
            backEndUrl: process.env.BACKEND_URL,
            user: req.user,
            notifications: req.notifications || [],
            notificationsCount: req.notificationsCount || 0
        });
    } catch (error) {
        console.error('Ошибка при загрузке списка питомцев:', error);
        res.status(500).render('pages/error', {
            title: 'Ошибка сервера',
            message: 'Ошибка при загрузке списка питомцев',
            error: error
        });
    }
});

router.get('/appointments', async (req, res) => {
    try {
        const appointments = await fetch(`${process.env.BACKEND_URL}/api/appointments`, {
            credentials: 'include'
        }).then(res => res.json());

        const vets = await fetch(`${process.env.BACKEND_URL}/api/vets`, {
            credentials: 'include'
        }).then(res => res.json());

        res.render('pages/admin/appointments', {
            activePage: 'appointments',
            appointments,
            vets,
            backEndUrl: process.env.BACKEND_URL,
            user: req.user,
            notifications: req.notifications || [],
            notificationsCount: req.notificationsCount || 0
        });
    } catch (error) {
        console.error('Ошибка при загрузке списка приемов:', error);
        res.status(500).render('pages/error', {
            title: 'Ошибка сервера',
            message: 'Ошибка при загрузке списка приемов',
            error: error
        });
    }
});

// 
router.get('/settings', async (req, res) => {
    try {
        const settings = await fetch(`${process.env.BACKEND_URL}/api/admin/settings`, {
            credentials: 'include'
        }).then(res => res.json());

        res.render('pages/admin/settings', {
            activePage: 'settings',
            settings,
            backEndUrl: process.env.BACKEND_URL,
            user: req.user,
            notifications: req.notifications || [],
            notificationsCount: req.notificationsCount || 0
        });
    } catch (error) {
        console.error('Ошибка при загрузке настроек:', error);
        res.status(500).render('pages/error', {
            title: 'Ошибка сервера',
            message: 'Ошибка при загрузке настроек',
            error: error
        });
    }
});

module.exports = router; 