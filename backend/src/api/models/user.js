const db = require('../../config/db');
const bcrypt = require('bcrypt');

const User = {
    getAll() {
        return db('users').select('users.*')
            .select(db.raw('EXISTS(SELECT 1 FROM user_bans WHERE user_bans.userid = users.userid) AS isBanned'));
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
    },

    getVeterinarians() {
        return db('users')
            .where({ role: 'Vet' })
            .select('userid', 'name');
    },

    // Методы для работы с ветеринарами
    getAllVets() {
        return db('users')
            .where({ role: 'Vet' })
            .select('userid', 'name', 'email', 'phoneNumber', 'specialization', 'isActive');
    },

    getActiveVets() {
        return db('users')
            .where({ role: 'Vet', isActive: true })
            .select('userid', 'name');
    },

    getVetById(userid) {
        return db('users')
            .where({ userid, role: 'Vet' })
            .select('userid', 'name', 'email', 'phoneNumber', 'specialization', 'isActive')
            .first();
    },

    toggleVetStatus(userid, isActive) {
        return db('users')
            .where({ userid, role: 'Vet' })
            .update({ isActive })
            .returning(['userid', 'name', 'isActive']);
    },

    updateVet(userid, updateData) {
        return db('users')
            .where({ userid, role: 'Vet' })
            .update(updateData)
            .returning(['userid', 'name', 'email', 'phoneNumber', 'specialization', 'isActive']);
    },

    createVet(vetData) {
        const data = {
            ...vetData,
            role: 'Vet',
            isActive: true
        };

        return this.create(data);
    }
};

module.exports = User;