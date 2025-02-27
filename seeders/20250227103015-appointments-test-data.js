'use strict';

/** @type {import('sequelize-cli').Seed} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('appointments', [{
                petid: 1,
                vetid: 5,
                date: new Date('2023-12-01T10:00:00Z'),
                diagnosis: "General Checkup",
                recomendations: "Follow up in 6 months",
                status: "1",
            },
            {
                petid: 2,
                vetid: 5,
                date: new Date('2023-12-02T14:00:00Z'),
                diagnosis: "Vaccination",
                recomendations: "Next vaccine in a year",
                status: "1",
            },
            {
                petid: 3,
                vetid: 5,
                date: new Date('2023-12-05T09:00:00Z'),
                diagnosis: "Dental Cleaning",
                recomendations: "Follow daily dental care",
                status: "0",
            }
        ], {});
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('appointments', null, {});
    }
};