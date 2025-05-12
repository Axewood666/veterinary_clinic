exports.up = function (knex) {
    return knex.schema.createTable('vet_schedules', function (table) {
        table.increments('id').primary();
        table.integer('vetid').references('userid').inTable('users');
        table.enum('day', ['1', '2', '3', '4', '5', '6', '7']); // 1 - Monday, 2 - Tuesday, 3 - Wednesday, 4 - Thursday, 5 - Friday, 6 - Saturday, 7 - Sunday
        table.time('start_time');
        table.time('end_time');
        table.boolean('is_active').defaultTo(true);
    });
};


exports.down = async function (knex) {
    await knex.raw('ALTER TABLE vet_schedules DROP CONSTRAINT IF EXISTS vet_schedules_day_check');
    return knex.schema.dropTable('vet_schedules');
};
