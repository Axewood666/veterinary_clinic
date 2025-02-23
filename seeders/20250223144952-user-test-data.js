
'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.bulkInsert('users', [
      {
        userid: 1,
        username: 'johndoe',
        password: 'testPass',
        role: 'Client',
        email: 'johndoe@example.com',
      },
      {
        userid: 2,
        username: 'janedoe',
        password: 'testPass2',
        role: 'Client',
        email: 'janedoe@example.com'
      }
    ], {});
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.bulkDelete('users', null, {});
  }
};

