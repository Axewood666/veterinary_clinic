'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.bulkInsert('pets', [{
                petid: 1,
                userid: 1,
                name: 'Нэш',
                age: 6,
                breed: 'Лабрадор',
                medicalhistory: "test",
                type: "Кот",
                gender: "мальчик"
            },
            {
                petid: 2,
                userid: 1,
                name: 'Нэш2',
                age: 6,
                breed: 'Лабрадор',
                medicalhistory: "test2",
                type: "Кот",
                gender: "мальчик"
            },
            {
                petid: 3,
                userid: 1,
                name: 'Нэш3',
                age: 6,
                breed: 'Лабрадор',
                medicalhistory: "test3",
                type: "Собака",
                gender: "Сука"
            }
        ], {})
    },

    async down(queryInterface, Sequelize) {
        await queryInterface.bulkDelete('pets', null, {});
    }
};