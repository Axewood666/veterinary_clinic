exports.up = function (knex) {
    return knex.schema.createTable('invitation_tokens', function (table) {
        table.increments('id').primary();
        table.string('token').notNullable().unique();
        table.enum('role', ['Admin', 'Vet', 'Manager']).notNullable();
        table.string('email').notNullable();
        table.boolean('used').defaultTo(false);
        table.timestamp('expires_at').notNullable();
        table.timestamp('created_at').defaultTo(knex.fn.now());
    });
};

exports.down = async function (knex) {
    await knex.raw('ALTER TABLE invitation_tokens DROP CONSTRAINT IF EXISTS invitation_tokens_role_check');
    return knex.schema.dropTable('invitation_tokens')
};
