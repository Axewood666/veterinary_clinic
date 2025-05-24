const express = require('express');
const path = require('path');
const cookieParser = require('cookie-parser');
const dotenv = require('dotenv');
const morgan = require('morgan');
const logger = require('./src/utils/logger');
dotenv.config();
const app = express();
app.set('view engine', 'pug');
app.set('views', path.join(__dirname, 'src/views'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'src/public')));
const morganFormat = process.env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, { stream: logger.stream }));
const fetchUser = require('./src/middlewares/fetchUser');
app.use(fetchUser);
if (process.env.LOG_API_REQUESTS === 'true') {
    const logApiRequests = require('./src/middlewares/logApiRequests');
    app.use(logApiRequests);
}
app.use('/', require('./src/routes/index'));
app.use('/api', require('./src/routes/api'));
app.use('/admin', require('./src/routes/admin'));
app.use('/auth', require('./src/routes/auth'));
app.use('/employee', require('./src/routes/employee'));
app.use('/client', require('./src/routes/client'));
app.use((err, req, res, next) => {
    const statusCode = err.statusCode || 500;
    const errorMessage = err.message || 'Внутренняя ошибка сервера';
    logger.error(`${statusCode} - ${errorMessage}`, {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
        body: req.body,
        stack: err.stack
    });
    if (req.originalUrl.startsWith('/api')) {
        const response = {
            error: errorMessage,
            ...(process.env.NODE_ENV !== 'production' && { stack: err.stack })
        };
        return res.status(statusCode).json(response);
    }
    res.status(statusCode).render('pages/error', {
        title: 'Ошибка',
        message: errorMessage,
        error: process.env.NODE_ENV !== 'production' ? err : {}
    });
});
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