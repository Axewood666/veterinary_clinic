const db = require('../../config/db');

const UserBan = {
    getAll() {
        return db('user_bans')
            .select('*');
    },

    getByUserId(userid) {
        return db('user_bans')
            .where({ userid })
            .first();
    },

    create(banData) {
        return db('user_bans')
            .insert(banData)
            .returning('*');
    },

    delete(userid) {
        return db('user_bans')
            .where({ userid })
            .del();
    }
};

module.exports = UserBan;