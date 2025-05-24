process.env.NODE_ENV = 'test';
const assert = require('assert');
const request = require('supertest');
const knexConfig = require('../knexfile').test;
const knex = require('knex')(knexConfig);
const app = require('../app');
describe('Auth API', function () {
    this.timeout(10000);
    before(async () => {
        await knex.migrate.rollback();
        await knex.migrate.latest();
        await knex.seed.run();
    });
    after(async () => {
        await knex.migrate.rollback();
        await knex.destroy();
    });
    describe('POST /auth/login', () => {
        it('успешный вход с валидными данными', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({ username: 'admin', password: 'admin123' });
            assert.equal(res.status, 200);
            assert.ok(res.body.token, 'должен вернуть JWT-токен');
            assert.equal(res.body.redirect, '/');
        });
        it('ошибка при неверном пароле', async () => {
            const res = await request(app)
                .post('/auth/login')
                .send({ username: 'admin', password: 'wrongpass' });
            assert.equal(res.status, 401);
        });
    });
    describe('POST /auth/invite', () => {
        it('успешная отправка приглашения для нового врача', async () => {
            const email = 'invitevet@example.com';
            const res = await request(app)
                .post('/auth/invite')
                .send({ email, role: 'Vet' });
            assert.equal(res.status, 201);
            assert.ok(res.body.message.includes(email));
            const inv = await knex('invitation_tokens').where({ email }).first();
            assert.ok(inv, 'должен появиться токен приглашения');
            assert.strictEqual(inv.used, false);
        });
        it('ошибка при приглашении уже существующего пользователя', async () => {
            const res = await request(app)
                .post('/auth/invite')
                .send({ email: 'admin@clinic.com', role: 'Vet' });
            assert.equal(res.status, 400);
        });
    });
});