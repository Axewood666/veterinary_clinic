const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');

// Загрузка переменных окружения
dotenv.config();

const app = express();

// Настройка шаблонизатора
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'src/views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'src/public')));

app.use((req, res, next) => {
    res.locals.errors = [];
    res.locals.success = [];

    res.addError = (message) => {
        res.locals.errors.push(message);
    };

    res.addSuccess = (message) => {
        res.locals.success.push(message);
    };

    next();
});

const fetchUser = require('./src/middlewares/fetchUser');
app.use(fetchUser);

app.use(require('./src/routes/index'));

app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).render('pages/error', {
        title: 'Ошибка',
        message: 'Что-то пошло не так!',
        error: err
    });
});

app.use((req, res) => {
    res.status(404).render('pages/error', {
        title: 'Страница не найдена',
        message: 'Страница не найдена',
        error: { message: 'Запрашиваемая страница не существует' }
    });
});

module.exports = app;