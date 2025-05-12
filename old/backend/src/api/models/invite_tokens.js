const db = require('../../config/db');
const crypto = require('crypto')

const invitation_token = {
    getAll() {
        return db('invitation_tokens')
            .select('*');
    },

    getById(tokenId) {
        return db('invitation_tokens')
            .where({ id: tokenId })
            .first();
    },

    getByToken(token) {
        return db('invitation_tokens')
            .where({ token, used: false })
            .where('expires_at', '>', new Date())
            .first();
    },

    updateUsedByToken(token) {
        return db('invitation_tokens')
            .where({ token })
            .update({ used: true });
    },

    getExistingInventationByEmail(email) {
        return db('invitation_tokens')
            .where({ email, used: false })
            .where('expires_at', '>', new Date())
            .first();
    },

    create(email, role) {
        const token = crypto.randomUUID();
        const expires_at = new Date();
        expires_at.setDate(expires_at.getDate() + 7);

        return db('invitation_tokens')
            .insert({ email, role, expires_at, token })
            .returning('*');
    },

    deleteById(tokenId) {
        return db('invitation_tokens')
            .where({ id: tokenId })
            .del();
    },

    deleteByToken(token) {
        return db('invitation_tokens').where({ token }).del();
    }
};

module.exports = invitation_token;