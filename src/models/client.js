// const knex = require('knex');
// const config = require('../db');

// const db = knex(config);

// const Client = {
//     getAll() {
//         return db('clients')
//             .select('*');
//     },

//     getById(clientid) {
//         return db('clients')
//             .where({ clientid })
//             .first();
//     },

//     create(clientData) {
//         return db('clients')
//             .insert(clientData)
//             .returning('*');
//     },

//     update(clientid, updateData) {
//         return db('clients')
//             .where({ clientid })
//             .update(updateData)
//             .returning('*');
//     },

//     delete(clientid) {
//         return db('clients')
//             .where({ clientid })
//             .del();
//     },

//     getAllWithRelations() {
//         return db('clients')
//             .join('users', 'clients.userid', '=', 'users.userid')
//             .select(
//                 'clients.*',
//                 'users.name as user_name',
//                 'users.email as user_email'
//             );
//     }
// };

// module.exports = Client;