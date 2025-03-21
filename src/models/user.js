const knex = require('knex');
const db = require('../config/db');
const bcrypt = require('bcrypt');

const User = {
    getAll() {
        return db('users')
            .select('*');
    },

    getById(userid) {
        return db('users')
            .where({ userid })
            .first();
    },

    create(userData) {
        const salt = bcrypt.genSaltSync(10);
        const hashedPassword = bcrypt.hashSync(userData.password, salt);
        userData.password = hashedPassword;

        return db('users')
            .insert(userData)
            .returning('*');
    },

    update(userid, updateData) {
        if (updateData.password) {
            const salt = bcrypt.genSaltSync(10);
            const hashedPassword = bcrypt.hashSync(updateData.password, salt);
            updateData.password = hashedPassword;
        }

        return db('users')
            .where({ userid })
            .update(updateData)
            .returning('*');
    },

    delete(userid) {
        return db('users')
            .where({ userid })
            .del();
    },

    getAllWithRelations() {
        return db('users')
            .select('*');
    }
};

module.exports = User;