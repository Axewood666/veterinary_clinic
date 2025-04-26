exports.seed = async function (knex) {
  await knex('vet_schedules').del()
  await knex('vet_schedules').insert([
    { id: 1, vetid: 5, day: '1', start_time: '09:00:00', end_time: '18:00:00', is_active: true },
    { id: 2, vetid: 5, day: '2', start_time: '09:00:00', end_time: '18:00:00', is_active: true },
    { id: 3, vetid: 5, day: '3', start_time: '09:00:00', end_time: '18:00:00', is_active: true },
    { id: 4, vetid: 5, day: '4', start_time: '09:00:00', end_time: '18:00:00', is_active: true },
    { id: 5, vetid: 5, day: '5', start_time: '09:00:00', end_time: '18:00:00', is_active: true },
    { id: 6, vetid: 5, day: '6', start_time: '09:00:00', end_time: '18:00:00', is_active: true },
    { id: 7, vetid: 5, day: '7', start_time: '09:00:00', end_time: '18:00:00', is_active: true }
  ]);
};
