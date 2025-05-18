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

    // describe('POST /auth/register', () => {
    //     it('успешная регистрация нового клиента', async () => {
    //         const payload = {
    //             email: 'newclient@example.com',
    //             username: 'newclient',
    //             password: 'pass1234'
    //         };
    //         const res = await request(app)
    //             .post('/auth/register')
    //             .send(payload);

    //         assert.equal(res.status, 201);
    //         assert.equal(res.body.redirect, '/');

    //         const user = await knex('users').where({ username: payload.username }).first();
    //         assert.ok(user, 'пользователь должен быть в БД');
    //         assert.notEqual(user.password, payload.password, 'пароль в БД должен быть захеширован');
    //     });

    //     it('ошибка при дублировании email', async () => {
    //         const res = await request(app)
    //             .post('/auth/register')
    //             .send({ email: 'admin@clinic.com', username: 'uniq', password: 'xxx' });
    //         assert.equal(res.status, 400);
    //     });
    // });

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