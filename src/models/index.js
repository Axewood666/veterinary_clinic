const User = require('./user');
const Client = require('./client');
const Pet = require('./pet');

User.hasOne(Client, { foreignKey: 'userId' });
Client.belongsTo(User, { foreignKey: 'userId' });

Client.hasMany(Pet, { foreignKey: 'clientId' });
Pet.belongsTo(Client, { foreignKey: 'clientId' });

module.exports = {
    User,
    Client,
    Pet
};