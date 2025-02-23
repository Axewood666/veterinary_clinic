const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const Client = require('./client');

class Pet extends Model { }

Pet.init({
    petid: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    clientid: {
        type: DataTypes.INTEGER,
        references: {
            model: Client,
            key: 'clientId',
        },
        allowNull: false,
    },
    name: {
        type: DataTypes.STRING,
        unique: false,
        allowNull: false,
    },
    breed: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    age: {
        type: DataTypes.INTEGER,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'pet',
    tableName: 'pets',
    timestamps: false,
});

module.exports = Pet;
