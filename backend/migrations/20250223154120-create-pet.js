// const { Sequelize, sequelize } = require("../models");

// module.exports = {
//     up: async (queryInterface, Sequelize) => {
//         await queryInterface.createTable('pets', {
//             petid: {
//                 type: Sequelize.INTEGER,
//                 primaryKey: true,
//                 autoIncrement: true,
//             },
//             userid: {
//                 type: Sequelize.INTEGER,
//                 references: {
//                     model: 'users',
//                     key: 'userid',
//                 },
//                 allowNull: false,
//             },
//             name: {
//                 type: Sequelize.STRING,
//                 unique: false,
//                 allowNull: false,
//             },
//             breed: {
//                 type: Sequelize.STRING,
//                 allowNull: false,
//             },
//             age: {
//                 type: Sequelize.INTEGER,
//                 allowNull: false,
//             },
//             medicalhistory: {
//                 type: Sequelize.TEXT,
//             },
//             type: {
//                 type: Sequelize.STRING,
//                 allowNull: false,
//             },
//             gender: {
//                 type: Sequelize.STRING,
//                 allowNull: false,
//             },
//         });
//     },

//     down: async (queryInterface, Sequelize) => {
//         await queryInterface.dropTable('pets');
//     }
// };
exports.up = function (knex) {
    return knex.schema.createTable('pets', function (table) {
        table.increments('petid').primary();
        table.integer('userid').references('userid').inTable('users');
        table.string('name').notNullable();
        table.string('breed').notNullable();
        table.integer('age').notNullable();
        table.text('medicalhistory');
        table.enum('type', ['dog', 'cat', 'bird', 'fish', 'other']).notNullable();
        table.enum('gender', ['male', 'female']).notNullable();
    });
};

exports.down = async function (knex) {
    await knex.raw('ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_type_check');
    await knex.raw('ALTER TABLE pets DROP CONSTRAINT IF EXISTS pets_gender_check');
    return knex.schema.dropTable('pets');
};