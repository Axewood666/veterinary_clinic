const express = require('express');
const path = require('path');
const app = express();

app.set('views', path.join(__dirname, 'src', 'views'));
app.set('view engine', 'pug');

const cookieParser = require('cookie-parser');
app.use(cookieParser());

app.use(express.json())
app.use(express.static(path.join(__dirname, 'src', 'public')));

const logger = require('./src/middlewares/logger');
app.use(logger);

const fetchUser = require('./src/middlewares/fetchUser')
app.use(fetchUser)

const routes = require('./src/routes');
app.use('/', routes);

app.use((err, req, res, next) => {
    console.error('Error:', err.stack);

    res.status(err.status || 500).render('pages/error', {
        message: err.message || 'An unexpected error occurred',
        error: process.env.NODE_ENV === 'development' ? err : null,
        user: req.user
    });
});

app.use((req, res, next) => {
    res.status(404).render('pages/error', {
        message: 'Page Not Found',
        error: null,
        user: req.user
    });
});

module.exports = app;