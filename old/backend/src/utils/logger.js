const winston = require('winston');
const { format } = require('winston');
const { combine, timestamp, printf, colorize, json } = format;
require('winston-daily-rotate-file');
const path = require('path');

// Определяем пути к файлам логов
const logDir = path.join(__dirname, '../../logs');

// Функция форматирования логов для консоли
const consoleFormat = printf(({ level, message, timestamp, ...meta }) => {
    return `${timestamp} ${level}: ${message} ${Object.keys(meta).length ? JSON.stringify(meta, null, 2) : ''}`;
});

// Транспорт для файлов с ошибками
const errorFileTransport = new winston.transports.DailyRotateFile({
    filename: path.join(logDir, 'error-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    level: 'error',
    format: combine(
        timestamp(),
        json()
    ),
    maxSize: '20m',
    maxFiles: '14d'
});

// Транспорт для всех логов
const combinedFileTransport = new winston.transports.DailyRotateFile({
    filename: path.join(logDir, 'combined-%DATE%.log'),
    datePattern: 'YYYY-MM-DD',
    format: combine(
        timestamp(),
        json()
    ),
    maxSize: '20m',
    maxFiles: '14d'
});

// Консольный транспорт
const consoleTransport = new winston.transports.Console({
    format: combine(
        colorize(),
        timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
        consoleFormat
    )
});

// Создаем экземпляр логгера
const logger = winston.createLogger({
    level: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
    defaultMeta: { service: 'veterinary-clinic-backend' },
    transports: [
        errorFileTransport,
        combinedFileTransport,
        consoleTransport
    ],
    // Не завершать процесс в случае необработанных ошибок
    exitOnError: false
});

// Глобальный обработчик необработанных ошибок
process.on('uncaughtException', (error) => {
    logger.error('Необработанное исключение:', error);
});

process.on('unhandledRejection', (reason, promise) => {
    logger.error('Необработанное отклонение промиса:', { reason, promise });
});

// Обертка для morgan для интеграции с winston
logger.stream = {
    write: (message) => {
        logger.info(message.trim());
    }
};

module.exports = logger; 