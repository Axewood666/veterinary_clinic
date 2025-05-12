const db = require('../../config/db');

const VetSchedules = {
    getAll() {
        return db('vet_schedules').select('*');
    },
    getById(id) {
        return db('vet_schedules').where('id', id).first();
    },
    create(vetSchedule) {
        return db('vet_schedules').insert(vetSchedule);
    },
    update(id, vetSchedule) {
        return db('vet_schedules').where('id', id).update(vetSchedule);
    },
    delete(id) {
        return db('vet_schedules').where('id', id).delete();
    },
    getByVetId(vetId) {
        return db('vet_schedules').where('vetid', vetId).select('*');
    },
    getAllWithRelations() {
        return db('vet_schedules')
            .select('vet_schedules.*', 'users.name as name')
            .leftJoin('users', 'vet_schedules.vetid', 'users.userid')
    },
    getByIdWithRelations(vetid) {
        return db('vet_schedules')
            .select('vet_schedules.*', 'users.name as name')
            .leftJoin('users', 'vet_schedules.vetid', 'users.userid')
            .where('vet_schedules.vetid', vetid)
    },
    async getAvailableSlotsOnNextWeek(vetId) {
        const currentDate = new Date();

        const endOfNextWeek = new Date(currentDate);
        endOfNextWeek.setDate(currentDate.getDate() + 6);

        const schedule = await db('vet_schedules')
            .where({ vetid: vetId, is_active: true })
            .first();

        if (!schedule) {
            return [];
        }

        const appointments = await db('appointments')
            .whereRaw('date::date >= ?', [currentDate.toISOString()])
            .andWhereRaw('date::date <= ?', [endOfNextWeek.toISOString().split('T')[0]])
            .andWhere({ vetId })
            .whereIn('status', ['scheduled', 'accepted']);

        const availableSlots = [];
        for (let i = 0; i < 7; i++) {
            const date = new Date(currentDate);
            date.setDate(currentDate.getDate() + i);
            const dailyAvailableSlots = findAvailableSlots(date, schedule.start_time, schedule.end_time, appointments);
            availableSlots.push({ date: date.toISOString().split('T')[0], slots: dailyAvailableSlots });
        }

        return availableSlots;
    }
}

function findAvailableSlots(date, startTime, endTime, appointments) {
    const availableSlots = [];
    const [startHour, startMinute] = startTime.split(':').map(Number);
    const [endHour, endMinute] = endTime.split(':').map(Number);

    const start = new Date(date.getFullYear(), date.getMonth(), date.getDate(), startHour, startMinute);
    const end = new Date(date.getFullYear(), date.getMonth(), date.getDate(), endHour, endMinute);
    if (new Date().getTime() >= start.getTime()) {
        start.setHours(new Date().getHours() + 1);
    }

    for (let time = start; time < end; time.setHours(time.getHours() + 1)) {
        const isSlotAvailable = !appointments.some(appointment => {
            const appointmentTime = new Date(appointment.date);
            return appointmentTime.getTime() === time.getTime();
        });
        if (isSlotAvailable) {
            availableSlots.push({
                start: time.getHours() + ':' + (time.getMinutes() < 10 ? '0' + time.getMinutes() : time.getMinutes())
            });
        }
    }

    return availableSlots;
}

module.exports = VetSchedules;
