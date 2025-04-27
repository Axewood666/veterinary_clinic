const express = require('express');
const router = express.Router();
const authorize = require('../middlewares/authorize')
const { fetchWithAuth } = require('../utils/fetch')

router.get('/admin/clients', authorize(["Admin"]), async (req, res) => {
    try {
        const clients = await fetchWithAuth('/api/clients', req.cookies?.token, {});

        res.render('pages/clients', {
            title: 'Clients Management',
            user: req.user,
            clients,
            backEndUrl: process.env.BACKEND_URL
        });

    } catch (error) {
        console.error('Error in /admin/clients route:', error);
        res.status(500).render('pages/error', {
            message: 'Failed to load clients data',
            error: error
        });
    }
});

module.exports = router;