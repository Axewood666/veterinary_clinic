const db = require('../../config/db');

const email_template = {
    getAll() {
        return db('email_templates')
            .select('*');
    },

    getById(id) {
        return db('email_templates')
            .where({ id })
            .first();
    },

    getByName(name) {
        return db('email_templates').where({ name }).first();
    },

    create(name, subject, body) {
        return db('email_templates').insert({ name, subject, body }).returning('*');
    },

    deleteById(id) {
        return db('email_templates')
            .where({ id })
            .del();
    }
};

module.exports = email_template;