const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const app = require('../../src/app');
const db = require('../../src/config/db');
const { Pets, Users } = require('../../src/models');
const { login } = require('../auth/auth_endpoint.test');

describe('Pet Endpoints', () => {
    var testUser = {
        name: 'Test User',
        username: 'axewood',
        password: 'axewood',
        email: "test2@mail.ru",
        role: 'Client'
    };

    var testAdmin = {
        name: 'Test Admin',
        username: 'admin',
        password: 'admin',
        email: "admin@mail.ru",
        role: 'Admin'
    };

    before(async () => {
        await db('appointments').del();
        await db('pets').del();
        await db('users').del();

        testUser = await Users.create(testUser);
        testUser = testUser[0];
        testUser.password = 'axewood';

        testAdmin = await Users.create(testAdmin);
        testAdmin = testAdmin[0];
        testAdmin.password = 'admin';

        await Pets.create({
            userid: testUser.userid,
            name: 'Test Pet',
            type: 'dog',
            breed: 'Labrador',
            gender: 'male',
            age: 2,
        });
    });

    after(async () => {
        await db('appointments').del();
        await db('pets').del();
        await db('users').del();
    });

    describe('GET /clients/:clientId/pets', () => {
        it('успешное получение питомцев клиента', async () => {
            const token = await login(testUser);

            const response = await request(app)
                .get(`/api/clients/${testUser.userid}/pets`)
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('pets');
            expect(response.body.pets).to.be.an('array');
            expect(response.body.pets[0]).to.have.property('name', 'Test Pet');
        });

        it('доступ запрещен для неавторизованного пользователя', async () => {
            const response = await request(app)
                .get(`/api/clients/${testUser.userid}/pets`);

            expect(response.status).to.equal(401);
        });

        it('клиент не найден', async () => {
            const token = await login(testUser);

            const response = await request(app)
                .get('/api/clients/999/pets')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).to.equal(404);
            expect(response.body).to.have.property('message', 'Client not found');
        });
    });

    describe('GET /pets', () => {
        it('получение всех питомцев (только для админа)', async () => {
            const adminToken = await login(testAdmin);

            const response = await request(app)
                .get('/api/pets')
                .set('Authorization', `Bearer ${adminToken}`);

            expect(response.status).to.equal(200);
            expect(response.body).to.have.property('clients');
            expect(response.body.clients).to.be.an('array');
            expect(response.body.clients[0]).to.have.property('name', 'Test User');
            expect(response.body.clients[0]).to.have.property('clientid', testUser.userid);
            expect(response.body.clients[0]).to.have.property('pets');
            expect(response.body.clients[0].pets).to.be.an('array');
            expect(response.body.clients[0].pets[0]).to.have.property('name', 'Test Pet');
        });

        it('доступ запрещен для неавторизованного пользователя', async () => {
            const response = await request(app)
                .get('/api/pets');

            expect(response.status).to.equal(401);
        });

        it('доступ запрещен для пользователя', async () => {
            const token = await login(testUser);

            const response = await request(app)
                .get('/api/pets')
                .set('Authorization', `Bearer ${token}`);

            expect(response.status).to.equal(403);
        });
    });
});

