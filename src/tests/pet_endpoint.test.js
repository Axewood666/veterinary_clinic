const request = require('supertest');
const chai = require('chai');
const expect = chai.expect;
const app = require('../app');

describe('Pet Controller Tests', function() {
    // Test the GET /clients/:clientId/pets endpoint
    describe('GET /clients/:clientId/pets', function() {
        it('should return client pets if authorized', async function() {
            const response = await request(app)
                .get('/clients/1/pets')
                .set('Authorization', 'Bearer VALID_TOKEN_FOR_USER_WITH_client_ID_1');

            expect(response.status).to.equal(201);
            expect(response.body).to.have.property('name');
            expect(response.body).to.have.property('clientid');
            expect(response.body).to.have.property('pets').that.is.an('array');
        });

        it('should return 403 if user is unauthorized', async function() {
            const response = await request(app)
                .get('/clients/2/pets')
                .set('Authorization', 'Bearer VALID_TOKEN_FOR_USER_WITH_client_ID_1');

            expect(response.status).to.equal(403);
            expect(response.body).to.have.property('message', 'You are not allowed to receive this clients pets');
        });

        it('should return 404 if client is not found', async function() {
            const response = await request(app)
                .get('/clients/9999/pets')
                .set('Authorization', 'Bearer VALID_TOKEN_FOR_ADMIN');

            expect(response.status).to.equal(404);
            expect(response.body).to.have.property('message', 'client not found');
        });
    });

    // Test the GET /pets endpoint
    describe('GET /pets', function() {
        it('should return all pets for authorized users', async function() {
            const response = await request(app)
                .get('/pets')
                .set('Authorization', 'Bearer VALID_TOKEN_FOR_ADMIN');

            expect(response.status).to.equal(201);
            expect(response.body).to.have.property('clients').that.is.an('array');
        });

        it('should return 403 if user is unauthorized', async function() {
            const response = await request(app)
                .get('/pets')
                .set('Authorization', 'Bearer VALID_TOKEN_FOR_GENERAL_USER');

            expect(response.status).to.equal(403);
        });
    });
});