const User = require('./user');
const Pet = require('./pet');

User.hasMany(Pet, { foreignKey: 'userid' });
Pet.belongsTo(User, { foreignKey: 'userid' });

module.exports = {
    User,
    Pet
};