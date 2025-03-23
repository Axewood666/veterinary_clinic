// 'use strict';

// /** @type {import('sequelize-cli').Migration} */
// module.exports = {
//     async up(queryInterface, Sequelize) {
//         await queryInterface.createTable('appointments', {
//             appointmentid: {
//                 type: Sequelize.DataTypes.INTEGER,
//                 autoIncrement: true,
//                 primaryKey: true
//             },
//             petid: {
//                 type: Sequelize.DataTypes.INTEGER,
//                 references: {
//                     model: 'pets',
//                     key: "petid",
//                 },
//                 allowNull: false
//             },
//             vetid: {
//                 type: Sequelize.DataTypes.INTEGER,
//                 references: {
//                     model: 'users',
//                     key: "userid",
//                 },
//                 allowNull: false,
//             },
//             date: {
//                 type: Sequelize.DataTypes.DATE,
//                 allowNull: false,
//                 defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
//             },
//             diagnosis: {
//                 type: Sequelize.DataTypes.STRING,
//             },
//             recomendations: {
//                 type: Sequelize.DataTypes.TEXT,
//             },
//             status: {
//                 type: Sequelize.DataTypes.ENUM("0", "1", "2"),
//                 allowNull: false,
//                 defaultValue: "0"
//             },
//         })
//     },
//     async down(queryInterface, Sequelize) {
//         await queryInterface.dropTable('appointments');
//     }
// };

exports.up = function (knex) {
    return knex.schema.createTable('appointments', function (table) {
        table.increments('appointmentid').primary();
        table.integer('petid').references('petid').inTable('pets').notNullable();
        table.integer('vetid').references('userid').inTable('users').notNullable();
        table.timestamp('date').notNullable().defaultTo(knex.fn.now());
        table.text('comment');
        table.string('diagnosis');
        table.text('recomendations');
        table.enu('status', ['scheduled', 'accepted', 'completed', 'cancelled']).notNullable().defaultTo('scheduled');
        table.enu('type', ['consultation', 'vaccination', 'other']).notNullable().defaultTo('other');
    });
};


exports.down = async function (knex) {
    await knex.raw('ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_type_check');
    await knex.raw('ALTER TABLE appointments DROP CONSTRAINT IF EXISTS appointments_status_check');
    return knex.schema.dropTable('appointments');
};