const { Model, DataTypes, Sequelize } = require('sequelize');
const sequelize = require('../config/db');
const Pet = require('./pet');
const User = require('./user');

class Appointments extends Model {}

Appointments.init({
    appointmentid: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    petid: {
        type: DataTypes.INTEGER,
        references: {
            model: Pet,
            key: "petid",
        },
        allowNull: false
    },
    vetid: {
        type: DataTypes.INTEGER,
        references: {
            model: User,
            key: "userid",
        },
        allowNull: false,
    },
    date: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    diagnosis: {
        type: DataTypes.STRING,
    },
    recomendations: {
        type: DataTypes.TEXT,
    },
    status: {
        type: DataTypes.ENUM("0", "1", "2"),
        allowNull: false,
        defaultValue: "0"
    },
    sequelize,
    modelName: 'appointment',
    tableName: 'appointments',
    timestamps: false,
})