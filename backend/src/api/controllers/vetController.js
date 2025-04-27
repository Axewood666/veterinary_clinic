const { Users, VetSchedules, Pets } = require('../models');
const _ = require('lodash')

exports.getVetSchedules = async (req, res) => {
    const vetSchedules = await VetSchedules.getAllWithRelations();
    res.status(200).json(vetSchedules);
}

exports.getVetScheduleById = async (req, res) => {
    const vet = await Users.getById(req.params.vetid);
    if (_.isEmpty(vet)) {
        return res.status(404).json({ message: 'Vet not found' });
    } else if (vet.role != 'Vet') {
        return res.status(403).json({ message: 'This action is only allowed for vets accounts' });
    }

    const vetSchedule = await VetSchedules.getByIdWithRelations(req.params.vetid);
    res.status(200).json(vetSchedule);
}

exports.getAvailableSlots = async (req, res) => {
    const vet = await Users.getById(req.params.vetid);
    if (_.isEmpty(vet)) {
        return res.status(404).json({ message: 'Vet not found' });
    } else if (vet.role != 'Vet') {
        return res.status(403).json({ message: 'This action is only allowed for vets accounts' });
    }

    const availableSlots = await VetSchedules.getAvailableSlotsOnNextWeek(req.params.vetid);
    res.status(200).json(availableSlots);
}

exports.getVeterinarians = async (req, res) => {
    const veterinarians = await Users.getVeterinarians();
    res.status(200).json(veterinarians);
}
