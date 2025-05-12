exports.up = function (knex) {
    return knex.schema.createTable('user_bans', function (table) {
        table.increments('id').primary();
        table.integer('userid').unsigned().notNullable()
            .references('userid').inTable('users').onDelete('CASCADE');
        table.text('reason').notNullable();
        table.timestamp('banned_at').defaultTo(knex.fn.now());
        table.timestamp('expires_at').nullable();
        table.integer('banned_by').unsigned()
            .references('userid').inTable('users');
    });
};

exports.down = function (knex) {
    return knex.schema.dropTable('user_bans');
};