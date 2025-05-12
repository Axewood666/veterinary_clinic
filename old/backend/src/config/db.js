const knex = require('knex');
const config = require('../../knexfile');

const environment = process.env.NODE_ENV || 'development';
const db = knex(config[environment]);

db.raw('SELECT 1')
    .then(() => {
        console.log('The database is connected successfully');
    })
    .catch((err) => {
        console.error('Database connection error: ', err);
    });

module.exports = db;