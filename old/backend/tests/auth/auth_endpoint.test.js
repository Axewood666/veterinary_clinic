const request = require('supertest');
const app = require('../../src/app');

module.exports.login = async (user) => {
    const response = await request(app)
        .post('/api/auth/login')
        .send({
            username: user.username,
            password: user.password
        });
    return response.body.token;
};