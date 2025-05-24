const knex = require('knex');
const knexConfig = require('../../knexfile');
const logger = require('../utils/logger');
const environment = process.env.NODE_ENV || 'development';
const db = knex(knexConfig[environment]);
db.raw('SELECT 1')
    .then(() => {
        logger.info(`Соединение с базой данных (${environment}) установлено`);
    })
    .catch(err => {
        logger.error(`Ошибка соединения с базой данных: ${err.message}`);
    });
module.exports = db; 