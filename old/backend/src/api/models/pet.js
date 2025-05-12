const knex = require('knex');
const db = require('../../config/db');

const Pet = {
    getAll() {
        return db('pets')
            .select('*');
    },

    getById(petid) {
        return db('pets')
            .where({ petid })
            .first();
    },

    create(petData) {
        return db('pets')
            .insert(petData)
            .returning('*');
    },

    update(petid, updateData) {
        return db('pets')
            .where({ petid })
            .update(updateData)
            .returning('*');
    },

    delete(petid) {
        return db('pets')
            .where({ petid })
            .del();
    },

    getAllWithRelations() {
        return db('pets')
            .join('users', 'pets.userid', '=', 'users.userid')
            .select(
                'pets.*',
                'users.name as owner_name',
                'users.email as owner_email'
            );
    },

    getByUserId(userid) {
        return db('pets')
            .where({ userid })
            .select('*');
    }
};

module.exports = Pet;