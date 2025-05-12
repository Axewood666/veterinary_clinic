const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
    res.render('pages/index', { title: 'Main', user: req.user });
});

router.get('/contact', (req, res) => {
    res.render('pages/contactus', { title: 'Contacts', user: req.user });
});


module.exports = router;