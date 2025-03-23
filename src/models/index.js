const Users = require('./user');
const Pets = require('./pet');
const Appointments = require('./appointments');
const VetSchedules = require('./vetShedules');

if (!Users || !Pets || !Appointments || !VetSchedules) {
    console.error('Error: One or more models failed to import');
}

module.exports = {
    Users,
    Pets,
    Appointments,
    VetSchedules
};