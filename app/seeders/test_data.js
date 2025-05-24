exports.seed = async function (knex) {
    await knex('appointments').del();
    await knex('vet_schedules').del();
    await knex('pets').del();
    await knex('user_bans').del();
    await knex('invitation_tokens').del();
    await knex('email_templates').del();
    await knex('settings').del();
    await knex('users').del();
    await knex('users').insert([
        {
            userid: 1,
            username: 'admin',
            password: 'admin123',
            role: 'Admin',
            email: 'admin@clinic.com',
            phoneNumber: '+71234567890',
            name: 'Администратор',
            avatar: null
        },
        {
            userid: 2,
            username: 'drvasin',
            password: 'vasin123',
            role: 'Vet',
            email: 'vasin@clinic.com',
            phoneNumber: '+79876543210',
            name: 'Доктор Васькин',
            avatar: null
        },
        {
            userid: 3,
            username: 'ivanov',
            password: 'ivanov123',
            role: 'Client',
            email: 'ivanov@mail.ru',
            phoneNumber: '+71239876543',
            name: 'Иван Иванов',
            avatar: null
        },
        {
            userid: 4,
            username: 'manager',
            password: 'manager123',
            role: 'Manager',
            email: 'manager@clinic.com',
            phoneNumber: '+70987654321',
            name: 'Менеджер',
            avatar: null
        }
    ]);
    await knex('settings').insert({
        clinic_name: 'Ветеринарная клиника',
        address: 'г. Москва, ул. Ленина, д. 10',
        phone: '+7 (495) 123-45-67',
        email: 'info@vetclinic.ru',
        working_hours: '9:00-18:00',
        appointment_duration: 30,
        website: 'http://vetclinic.ru',
        logo_url: 'http://vetclinic.ru/logo.png'
    });
    await knex('email_templates').insert([
        {
            name: 'welcome',
            subject: 'Добро пожаловать в Ветеринарную клинику',
            body: 'Здравствуйте {{name}}, рады видеть вас в нашей клинике!'
        },
        {
            name: 'appointment_reminder',
            subject: 'Напоминание о приёме',
            body: 'У вас запланирован приём {{date}} в {{time}}. До встречи!'
        }
    ]);
    await knex('invitation_tokens').insert([
        {
            token: 'invite-vet-token',
            role: 'Vet',
            email: 'newvet@clinic.com',
            used: false,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) 
        }
    ]);
    await knex('user_bans').insert([
        {
            userid: 3,
            reason: 'Просроченный платёж',
            banned_at: new Date(),
            expires_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), 
            banned_by: 1
        }
    ]);
    await knex('pets').insert([
        {
            petid: 1,
            userid: 3,
            name: 'Барсик',
            breed: 'Сибирский',
            age: 2,
            medicalhistory: 'Лечился от простуды',
            type: 'cat',
            gender: 'male'
        },
        {
            petid: 2,
            userid: 3,
            name: 'Шарик',
            breed: 'Лабрадор',
            age: 4,
            medicalhistory: 'Аллергия на пыльцу',
            type: 'dog',
            gender: 'male'
        }
    ]);
    await knex('vet_schedules').insert([
        {
            id: 1,
            vetid: 2,
            day: '1',        
            start_time: '09:00',
            end_time: '18:00',
            is_active: true
        },
        {
            id: 2,
            vetid: 2,
            day: '3',        
            start_time: '10:00',
            end_time: '17:00',
            is_active: true
        }
    ]);
    await knex('appointments').insert([
        {
            appointmentid: 1,
            petid: 1,
            vetid: 2,
            comment: 'Первичный осмотр',
            diagnosis: null,
            recomendations: null,
            status: 'scheduled',
            type: 'consultation',
            clientId: 3,
            time: '10:00'
        }
    ]);
};