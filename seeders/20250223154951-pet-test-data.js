'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('pets', [{
      petid: 1,
      clientid: 1,
      name: 'Нэш',
      age: 6,
      breed: 'Лабрадор',
      medicalhistory: "test"
    }], {})
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('pets', null, {});
  }
};
