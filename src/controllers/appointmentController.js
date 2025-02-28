const { User, Pet, Appointment } = require('../models/');
const { validationResult } = require('express-validator');
const _ = require('lodash');

exports.getAppointments = async (req, res) => {
    try{
        const userid = +req.params.userid;
        const pets = Pet.findAll({ where: { userid } })
        if(_.isEmpty(pets)){
            res.status(404).json({error: "..."})
            return;
        }
        const petsIds = pets.map(item => item.petid)
        const appointments = Appointment.findAll({ where: { petid: {
            [Sequelize.Op.in]: petsIds
        } } })
        res.status(200).json(appointments);
    }catch(err){
        res.status(500).json({error: err})
    }
}
