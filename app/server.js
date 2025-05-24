const app = require('./app');
const logger = require('./src/utils/logger');
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    logger.info(`Сервер запущен на порту ${PORT}`);
    logger.info(`Режим: ${process.env.NODE_ENV || 'development'}`);
}); 