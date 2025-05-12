exports.up = function (knex) {
    return knex.schema.createTable('email_templates', function (table) {
        table.increments('id').primary();
        table.string('name').unique().notNullable();
        table.string('subject').notNullable();
        table.text('body').notNullable();
    });
};


exports.down = function (knex) {
    return knex.schema.dropTable('email_templates');
};