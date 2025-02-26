const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');
const User = require('./user');

class Pet extends Model {}

Pet.init({
    petid: {
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
    medicalhistory: {
        type: DataTypes.TEXT,
    },
    type: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    gender: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    sequelize,
    modelName: 'pet',
    tableName: 'pets',
    timestamps: false,
});

module.exports = Pet;