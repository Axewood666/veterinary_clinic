const knex = require('knex');
const config = require('../../knexfile');

const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);

db.raw('SELECT 1')
    .then(() => {
        console.log('База данных подключена успешно');
    })
    .catch((err) => {
        console.error('Ошибка подключения к базе данных:', err);
    });

module.exports = db;