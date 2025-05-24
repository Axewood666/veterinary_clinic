exports.up = function (knex) {
    return knex.schema
        .createTable('users', table => {
            table.increments('userid').primary();
            table.string('username').notNullable().unique();
            table.string('password').notNullable();
            table.enum('role', ['Admin', 'Vet', 'Client', 'Manager']).notNullable();
            table.string('email').notNullable();
            table.string('phoneNumber');
            table.string('name');
        })
        .createTable('pets', table => {
            table.increments('petid').primary();
            table.integer('userid').unsigned().notNullable().references('userid').inTable('users');
            table.string('name').notNullable();
            table.string('breed').notNullable();
            table.integer('age').notNullable();
            table.text('medicalhistory');
            table.enum('type', ['dog', 'cat', 'bird', 'fish', 'other']).notNullable();
            table.enum('gender', ['male', 'female']).notNullable();
        })
        .createTable('appointments', table => {
            table.increments('appointmentid').primary();
            table.integer('petid').unsigned().notNullable().references('petid').inTable('pets');
            table.integer('vetid').unsigned().notNullable().references('userid').inTable('users');
            table.timestamp('date').notNullable().defaultTo(knex.fn.now());
            table.text('comment');
            table.string('diagnosis');
            table.text('recomendations');
            table.enum('status', ['scheduled', 'accepted', 'completed', 'cancelled']).notNullable().defaultTo('scheduled');
            table.enum('type', ['consultation', 'vaccination', 'other']).notNullable().defaultTo('other');
            table.integer('clientId').unsigned().references('userid').inTable('users');
            table.string('time').notNullable();
        })
        .createTable('vet_schedules', table => {
            table.increments('id').primary();
            table.integer('vetid').unsigned().references('userid').inTable('users');
            table.enum('day', ['1', '2', '3', '4', '5', '6', '7']); 
            table.time('start_time');
            table.time('end_time');
            table.boolean('is_active').defaultTo(true);
        })
        .createTable('invitation_tokens', table => {
            table.increments('id').primary();
            table.string('token').notNullable().unique();
            table.enum('role', ['Admin', 'Vet', 'Manager']).notNullable();
            table.string('email').notNullable();
            table.boolean('used').defaultTo(false);
            table.timestamp('expires_at').notNullable();
            table.timestamp('created_at').defaultTo(knex.fn.now());
        })
        .createTable('email_templates', table => {
            table.increments('id').primary();
            table.string('name').unique().notNullable();
            table.string('subject').notNullable();
            table.text('body').notNullable();
        })
        .createTable('user_bans', table => {
            table.increments('id').primary();
            table.integer('userid').unsigned().notNullable()
                .references('userid').inTable('users').onDelete('CASCADE');
            table.text('reason').notNullable();
            table.timestamp('banned_at').defaultTo(knex.fn.now());
            table.timestamp('expires_at').nullable();
            table.integer('banned_by').unsigned()
                .references('userid').inTable('users');
        })
        .createTable('settings', table => {
            table.increments('id').primary();
            table.string('clinic_name').notNullable().defaultTo('Ветеринарная клиника');
            table.text('address').nullable();
            table.string('phone').nullable();
            table.string('email').nullable();
            table.string('working_hours').nullable();
            table.integer('appointment_duration').defaultTo(30);
            table.string('website').nullable();
            table.string('logo_url').nullable();
            table.timestamps(true, true);
        });
};
exports.down = function (knex) {
    return knex.schema
        .dropTableIfExists('settings')
        .dropTableIfExists('user_bans')
        .dropTableIfExists('email_templates')
        .dropTableIfExists('invitation_tokens')
        .dropTableIfExists('vet_schedules')
        .dropTableIfExists('appointments')
        .dropTableIfExists('pets')
        .dropTableIfExists('users');
}; 