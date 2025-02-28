const User = require('./user');
const Pet = require('./pet');
const Appointment = require('./appointments')

User.hasMany(Pet, { foreignKey: 'userid' });
Pet.belongsTo(User, { foreignKey: 'userid' });
User.hasMany(Appointment, { foreignKey: 'userid'});
Appointment.belongsTo(User, {foreignKey: 'userid'});
Pet.hasMany(Appointment, {foreignKey: 'petid'})
Appointment.belongsTo(Pet, {foreignKey: 'petid'})

module.exports = {
    User,
    Pet,
    Appointment
};