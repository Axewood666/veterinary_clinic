const Users = require('./user');
const Pets = require('./pet');
const Appointments = require('./appointments');
const VetSchedules = require('./vetShedules');
const invitation_token = require('./invite_tokens');
const email_template = require('./email_template');

module.exports = {
    Users,
    Pets,
    Appointments,
    VetSchedules,
    invitation_token,
    email_template
};