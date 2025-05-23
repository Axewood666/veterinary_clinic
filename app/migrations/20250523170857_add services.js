/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.up = function (knex) {
    //  select "id", "name", "description", "price", "image", "category" from "services" order by "category" asc, "name" asc - relation "services" does not exist
    return knex.schema.createTable('services', function (table) {
        table.increments('id').primary();
        table.string('name').notNullable();
        table.string('description').notNullable();
        table.decimal('price', 10, 2).notNullable();
        table.string('image').defaultTo('https://i.ytimg.com/vi/e6w-EkLZbiM/maxresdefault.jpg');
        table.string('category').defaultTo('other');
        table.timestamps(true, true);
    });
};

/**
 * @param { import("knex").Knex } knex
 * @returns { Promise<void> }
 */
exports.down = function (knex) {
    return knex.schema.dropTable('services');
};
