exports.up = function (knex) {
    return knex.schema.alterTable('users', function (table) {
        table.string('avatar').nullable();
    });
};
exports.down = function (knex) {
    return knex.schema.alterTable('users', function (table) {
        table.dropColumn('avatar');
    });
};
