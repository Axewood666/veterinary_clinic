const { User, Pet, Appointment } = require('../models/');
const Sequelize = require('sequelize');
const { validationResult } = require('express-validator');
const _ = require('lodash');

exports.getAppointments = async(req, res) => {
    try {
        const userid = req.params.userid;
        const user = req.user;

        if (user.role === 'Client' && user.userid !== userid) {
            return res.status(403).json({ message: 'You are not allowed to receive this client\'s appointments' });
        }
        const client = await User.findByPk(userid);
        if (_.isEmpty(client)) {
            return res.status(404).json({ message: 'Client not found' });
        }

        const pets = await Pet.findAll({ where: { userid } });
        if (_.isEmpty(pets)) {
            res.status(404).json({ error: "..." })
            return;
        }
        const petsIds = pets.map(item => item.petid)
        const appointments = await Appointment.findAll({
            where: {
                petid: {
                    [Sequelize.Op.in]: petsIds
                }
            }
        });
        res.status(200).json(appointments);
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
}