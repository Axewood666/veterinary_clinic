const { Users, Pets, Appointments, VetSchedules } = require('../models/');
const { validationResult } = require('express-validator');
const _ = require('lodash');

exports.getAppointments = async (req, res) => {
    try {
        const userid = req.params.userid;
        const user = req.user;
        const status = req.query.status;

        if (user.role == 'Client' && user.userid != userid) {
            return res.status(403).json({
                message: 'You are not allowed to receive this client\'s appointments'
            });
        }

        const client = await Users.getById(userid);
        if (_.isEmpty(client)) {
            return res.status(404).json({ message: 'Client not found' });
        } else if (client.role != 'Client') {
            return res.status(403).json({ message: 'This action is only allowed for clients accounts' });
        }

        const pets = await Pets.getAll().where({ userid });
        if (_.isEmpty(pets)) {
            return res.status(404).json({ error: "No pets found" });
        }

        let query = Appointments.getAllWithRelations()

        if (status) {
            query = query.where('appointments.status', status);
        }
        query = query.whereIn('appointments.petid', pets.map(item => item.petid));
        query = query.orderBy('appointments.date', 'asc');

        const appointments = await query;
        res.status(200).json(appointments);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
};

exports.createAppointment = async (req, res) => {
    try {
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            return res.status(400).json({
                message: 'Validation error',
                errors: errors.array()
            });
        }

        const validDate = new Date(req.body.date);
        const currentDate = new Date();
        const sevenDaysFromNow = new Date(currentDate.getTime());
        sevenDaysFromNow.setDate(sevenDaysFromNow.getDate() + 7);
        if (validDate < currentDate || validDate > sevenDaysFromNow) {
            return res.status(400).json({ message: 'Date must be within 7 days' });
        }

        const user = req.user;
        const userid = req.params.userid;

        if (user.role == 'Client' && user.userid != userid) {
            return res.status(403).json({ message: 'You are not allowed' });
        }

        const client = await Users.getById(userid);
        if (_.isEmpty(client)) {
            return res.status(404).json({ message: 'Client not found' });
        } else if (client.role != 'Client') {
            return res.status(403).json({ message: 'This action is only allowed for clients accounts' });
        }

        const pet = await Pets.getById(req.body.petid);
        if (_.isEmpty(pet)) {
            return res.status(404).json({
                message: 'Pet not found'
            });
        } else if (pet.userid != userid) {
            return res.status(403).json({
                message: 'This pet is not assigned to this client'
            });
        }

        const vet = await Users.getById(req.body.vetid);
        if (_.isEmpty(vet) || vet.role != 'Vet') {
            return res.status(404).json({ message: 'Vet not found' });
        }

        const availableSlots = await VetSchedules.getAvailableSlots(vet.userid, validDate);
        if (_.isEmpty(availableSlots)) {
            return res.status(404).json({ message: 'No available slots' });
        }
        const slot = availableSlots.find(slot => slot.start == validDate.getHours() + ':' + (validDate.getMinutes() < 10 ? '0' + validDate.getMinutes() : validDate.getMinutes()));
        if (_.isEmpty(slot)) {
            return res.status(404).json({ message: 'No available slots' });
        }

        const { petid, date, comment, vetid, type } = req.body;

        const appointment = await Appointments.create({
            petid,
            date,
            comment,
            vetid,
            type,
            status: 'scheduled'
        });

        if (_.isEmpty(appointment)) {
            return res.status(400).json({ message: 'Failed to create appointment' });
        }

        res.status(201).json(appointment[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


exports.acceptAppointment = async (req, res) => {
    try {
        const appointment = await Appointments.update(req.params.appointmentid, { status: 'accepted' });
        if (_.isEmpty(appointment)) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        res.status(200).json(appointment[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.deleteAppointment = async (req, res) => {
    try {
        const user = req.user;
        const userid = req.params.userid;

        if (user.role == 'Client' && user.userid != userid) {
            return res.status(403).json({ message: 'You are not allowed' });
        }

        await Appointments.delete(req.params.appointmentid);

        res.status(200).json({ message: 'Appointment deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

exports.updateAppointment = async (req, res) => {
    try {
        const userid = req.params.userid;

        const { date, comment, diagnosis, type, status, recomendations } = req.body;

        const user = await Users.getById(userid);
        if (_.isEmpty(user)) {
            return res.status(404).json({ message: 'User not found' });
        } else if (user.role != 'Client') {
            return res.status(403).json({ message: 'This action is only allowed for clients accounts' });
        }

        const appointment = await Appointments.getById(req.params.appointmentid);
        if (_.isEmpty(appointment)) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        const newAppointment = await Appointments.update(req.params.appointmentid, { date, comment, diagnosis, type, status, recomendations });
        if (_.isEmpty(newAppointment)) {
            return res.status(400).json({ message: 'Failed to update appointment' });
        }

        res.status(200).json(newAppointment[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}   