const express = require('express');
const app = express();
const cors = require('cors');
const morgan = require('morgan');
const cookieParser = require('cookie-parser');
const logger = require('./src/utils/logger');

// Настройка CORS
app.use(cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
}));

// Подключение morgan для логирования HTTP запросов
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, { stream: logger.stream }));

// Middleware для парсинга JSON и cookies
app.use(express.json());
app.use(cookieParser());

// Регистрация маршрутов API
const apiRoutes = require('./src/api/routes');
app.use('/api', apiRoutes);

// Обработка ошибок 404
app.use((req, res, next) => {
    logger.warn(`404 - Маршрут не найден: ${req.method} ${req.originalUrl}`);
    res.status(404).json({ error: 'Маршрут не найден' });
});

// Централизованная обработка ошибок
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const errorMessage = err.message || 'Внутренняя ошибка сервера';

    // Логирование ошибки с деталями запроса
    logger.error(`${statusCode} - ${errorMessage}`, {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        body: req.body,
        stack: err.stack
    });

    // Отправка ответа клиенту
    // В продакшен режиме не показываем стек вызовов
    const response = {
        error: errorMessage,
        ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
    };

    res.status(statusCode).json(response);
});

module.exports = app;