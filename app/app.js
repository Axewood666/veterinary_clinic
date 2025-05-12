const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const cors = require('cors');
const morgan = require('morgan');
const logger = require('./utils/logger');

// Загрузка переменных окружения
dotenv.config();

const app = express();

// Настройка шаблонизатора
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'views'));

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

// Логирование запросов
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, { stream: logger.stream }));

// Получение информации о пользователе
const fetchUser = require('./middlewares/fetchUser');
app.use(fetchUser);

// Подключение маршрутов
app.use('/', require('./routes/index'));
app.use('/api', require('./routes/api'));
app.use('/admin', require('./routes/admin'));
app.use('/auth', require('./routes/auth'));

// Обработка ошибок
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const errorMessage = err.message || 'Внутренняя ошибка сервера';

    // Логирование ошибки
    logger.error(`${statusCode} - ${errorMessage}`, {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        body: req.body,
        stack: err.stack
    });

    // Если API запрос - вернуть JSON
    if (req.originalUrl.startsWith('/api')) {
        const response = {
            error: errorMessage,
            ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
        };
        return res.status(statusCode).json(response);
    }

    // Для обычных запросов - отобразить страницу с ошибкой
    res.status(statusCode).render('pages/error', {
        title: 'Ошибка',
        message: errorMessage,
        error: process.env.NODE_ENV !== 'production' ? err : {}
    });
});

// Обработка 404
app.use((req, res) => {
    if (req.originalUrl.startsWith('/api')) {
        return res.status(404).json({ error: 'Маршрут не найден' });
    }

    res.status(404).render('pages/error', {
        title: 'Страница не найдена',
        message: 'Страница не найдена',
        error: { message: 'Запрашиваемая страница не существует' }
    });
});

module.exports = app; 