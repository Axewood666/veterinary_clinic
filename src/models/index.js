const User = require('./user');
const Client = require('./client');
const Pet = require('./pet');

User.hasOne(Client, { foreignKey: 'userid' });
Client.belongsTo(User, { foreignKey: 'userid' });

Client.hasMany(Pet, { foreignKey: 'clientid' });
Pet.belongsTo(Client, { foreignKey: 'clientid' });

module.exports = {
    User,
    Client,
    Pet
};