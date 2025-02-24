'use strict';

module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.bulkInsert('clients', [{
                clientid: 1,
                userid: 1,
                name: 'Client One',
                address: '123 Main St',
                phoneNumber: '0987654321',
                email: 'client@example.com',
            },
            {
                clientid: 2,
                userid: 2,
                name: 'Client 3',
                address: '123 Main St',
                phoneNumber: '0987654321',
                email: 'client@example.com',
            }
        ], {});
    },

    down: async(queryInterface, Sequelize) => {
        await queryInterface.bulkDelete('clients', null, {});
    }
};