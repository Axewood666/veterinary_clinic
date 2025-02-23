const { Sequelize, sequelize } = require("../models");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.createTable('pets', {
      petid: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true,
      },
      clientid: {
        type: Sequelize.INTEGER,
        references: {
          model: 'clients',
          key: 'clientid',
        },
        allowNull: false,
      },
      name: {
        type: Sequelize.STRING,
        unique: false,
        allowNull: false,
      },
      breed: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      age: {
        type: Sequelize.INTEGER,
        allowNull: false,
      },
      medicalhistory: {
        type: Sequelize.TEXT,
      }
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.dropTable('pets');
  }
};
