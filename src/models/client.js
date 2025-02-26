const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user');

class Client extends Model {}

Client.init({
    clientid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    userid: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: 'userid',
        },
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    address: {
        type: DataTypes.STRING,
    },
    phoneNumber: {
        type: DataTypes.STRING,
    },
    email: {
        type: DataTypes.STRING,
    },
}, {
    sequelize,
    modelName: 'Client',
    tableName: 'clients',
    timestamps: false,
});

module.exports = Client;