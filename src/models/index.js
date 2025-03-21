const Users = require('./user');
const Pets = require('./pet');
const Appointments = require('./appointments');

if (!Users || !Pets || !Appointments) {
    console.error('Error: One or more models failed to import');
}

module.exports = {
    Users,
    Pets,
    Appointments
};