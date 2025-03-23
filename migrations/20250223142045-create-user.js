// module.exports = {
//     up: async(queryInterface, Sequelize) => {
//         await queryInterface.createTable('users', {
//             userid: {
//                 type: Sequelize.INTEGER,
//                 primaryKey: true,
//                 autoIncrement: true,
//             },
//             username: {
//                 type: Sequelize.STRING,
//                 unique: true,
//                 allowNull: false,
//             },
//             password: {
//                 type: Sequelize.STRING,
//                 allowNull: false,
//             },
//             role: {
//                 type: Sequelize.ENUM('Admin', 'Vet', 'Client'),
//                 allowNull: false,
//             },
//             email: {
//                 type: Sequelize.STRING,
//                 allowNull: false,
//             },
//             phoneNumber: {
//                 type: Sequelize.STRING,
//             },
//             name: {
//                 type: Sequelize.STRING
//             }
//         });
//     },

//     down: async(queryInterface, Sequelize) => {
//         await queryInterface.dropTable('users');
//     }
// };

exports.up = function (knex) {
    return knex.schema.createTable('users', function (table) {
        table.increments('userid').primary();
        table.string('username').notNullable().unique();
        table.string('password').notNullable();
        table.enu('role', ['Admin', 'Vet', 'Client', 'Manager']).notNullable();
        table.string('email').notNullable();
        table.string('phoneNumber');
        table.string('name');
    });
};

exports.down = async function (knex) {
    await knex.raw('ALTER TABLE users DROP CONSTRAINT IF EXISTS users_role_check');
    return knex.schema.dropTable('users');
};