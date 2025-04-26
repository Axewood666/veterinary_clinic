const { Users, Pets, Appointments, VetSchedules } = require('../models');
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
    const { userid } = req.params;
    const { petid, date, comment, vetid, type } = req.body;

    try {
        if (!isValidDate(date)) {
            return res.status(400).json({ message: 'Date must be within the next 7 days' });
        }
        const validDate = new Date(date);

        const user = req.user;
        if (user.role === 'Client' && user.userid !== userid) {
            return res.status(403).json({ message: 'You are not authorized to perform this action' });
        }

        const client = await Users.getById(userid);
        if (_.isEmpty(client) || client.role !== 'Client') {
            return res.status(404).json({ message: 'Client not found or not authorized' });
        }

        const pet = await Pets.getById(petid);
        if (_.isEmpty(pet) || pet.userid !== userid) {
            return res.status(404).json({ message: 'Pet not found or not assigned to this client' });
        }

        const vet = await Users.getById(vetid);
        if (_.isEmpty(vet) || vet.role !== 'Vet') {
            return res.status(404).json({ message: 'Vet not found or not authorized' });
        }

        const availableSlots = await VetSchedules.getAvailableSlots(vet.userid, validDate);
        const slotTime = validDate.getHours() + ':' + (validDate.getMinutes() < 10 ? '0' + validDate.getMinutes() : validDate.getMinutes());
        const slot = availableSlots.find(slot => slot.start === slotTime);
        if (!slot) {
            return res.status(404).json({ message: 'No available slots' });
        }

        const appointment = await Appointments.create({
            petid,
            date,
            comment,
            vetid,
            type,
            status: 'scheduled'
        });

        if (_.isEmpty(appointment)) {
            return res.status(500).json({ message: 'Failed to create appointment' });
        }

        res.status(201).json(appointment);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}


exports.acceptAppointment = async (req, res) => {
    try {
        const appointmentid = req.params.appointmentid;

        const appointment = await Appointments.getById(appointmentid);
        if (_.isEmpty(appointment)) {
            return res.status(404).json({ message: 'Appointment not found' });
        }

        if (appointment.status != 'scheduled') {
            return res.status(400).json({ message: 'Appointment is not scheduled' });
        }

        const updatedAppointment = await Appointments.update(appointmentid, { status: 'accepted' });
        if (_.isEmpty(updatedAppointment)) {
            return res.status(400).json({ message: 'Failed to accept appointment' });
        }

        res.status(200).json(updatedAppointment[0]);
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

        if (!isValidDate(date)) {
            return res.status(400).json({ message: 'Date must be within the next 7 days' });
        }
        const validDate = new Date(date);

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

        const newAppointment = await Appointments.update(req.params.appointmentid, { date: validDate, comment, diagnosis, type, status, recomendations });
        if (_.isEmpty(newAppointment)) {
            return res.status(400).json({ message: 'Failed to update appointment' });
        }

        res.status(200).json(newAppointment[0]);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
}

function isValidDate(date) {
    const validDate = new Date(date);
    const currentDate = new Date();
    const sevenDaysFromNow = new Date();
    sevenDaysFromNow.setDate(currentDate.getDate() + 7);

    if (isNaN(validDate.getTime()) || validDate < currentDate || validDate > sevenDaysFromNow) {
        return false;
    }
    return true;
}
