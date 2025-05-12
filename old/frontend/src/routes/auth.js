const express = require('express');
const router = express.Router();

router.get('/login', (req, res) => {
    res.render('pages/login', {
        title: 'Login',
        backendEndpoint: `${process.env.BACKEND_URL}/api/auth/login`
    });
});

router.get('/register', (req, res) => {
    res.render('pages/register', {
        title: 'Registration',
        backendEndpoint: `${process.env.BACKEND_URL}/api/auth/register`
    });
});

module.exports = router;