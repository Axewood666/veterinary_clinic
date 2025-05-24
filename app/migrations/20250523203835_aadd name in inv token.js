exports.up = function (knex) {
    return knex.schema.alterTable('invitation_tokens', function (table) {
        table.string('name').nullable();
    });
};
exports.down = function (knex) {
    return knex.schema.alterTable('invitation_tokens', function (table) {
        table.dropColumn('name');
    });
};
