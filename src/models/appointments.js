const knex = require('knex');
const db = require('../config/db');

const Appointments = {
    getAll() {
        return db('appointments')
            .select('*');
    },

    getById(appointmentid) {
        return db('appointments')
            .where({ appointmentid })
            .first();
    },

    create(appointmentData) {
        return db('appointments')
            .insert(appointmentData)
            .returning('*');
    },

    update(appointmentid, updateData) {
        return db('appointments')
            .where({ appointmentid })
            .update(updateData)
            .returning('*');
    },

    delete(appointmentid) {
        return db('appointments')
            .where({ appointmentid })
            .del();
    },

    getAllWithRelations() {
        return db('appointments')
            .join('pets', 'appointments.petid', '=', 'pets.petid')
            .join('users', 'appointments.vetid', '=', 'users.userid')
            .select(
                'appointments.*',
                'pets.name as pet_name',
                'users.name as vet_name'
            );
    }
};

module.exports = Appointments;