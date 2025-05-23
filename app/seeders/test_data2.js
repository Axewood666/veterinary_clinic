const bcrypt = require('bcrypt');

exports.seed = async function (knex) {
    // 1) Очистка таблиц (учитываем FKs)
    await knex('appointments').del();
    await knex('vet_schedules').del();
    await knex('pets').del();
    await knex('user_bans').del();
    await knex('invitation_tokens').del();
    await knex('email_templates').del();
    await knex('settings').del();
    await knex('users').del();
    await knex('services').del();

    // 2) Хешируем пароли
    const saltRounds = 10;
    const [adminHash, vetHash, clientHash, managerHash] = await Promise.all([
        bcrypt.hash('admin123', saltRounds),
        bcrypt.hash('vasin123', saltRounds),
        bcrypt.hash('ivanov123', saltRounds),
        bcrypt.hash('manager123', saltRounds),
    ]);

    // 3) Пользователи с уже хешированными паролями
    await knex('users').insert([
        {
            userid: 1,
            username: 'admin',
            password: adminHash,
            role: 'Admin',
            email: 'admin@clinic.com',
            phoneNumber: '+71234567890',
            name: 'Администратор',
            avatar: "https://steamuserimages-a.akamaihd.net/ugc/2358265741743006609/9E87FE65DA1E3AD6D31936C601A18FFDA88EF2C1/?imw=512&amp;imh=288&amp;ima=fit&amp;impolicy=Letterbox&amp;imcolor=%23000000&amp;letterbox=true"
        },
        {
            userid: 2,
            username: 'drvasin',
            password: vetHash,
            role: 'Vet',
            email: 'vasin@clinic.com',
            phoneNumber: '+79876543210',
            name: 'Доктор Васькин',
            avatar: null
        },
        {
            userid: 3,
            username: 'ivanov',
            password: clientHash,
            role: 'Client',
            email: 'ivanov@mail.ru',
            phoneNumber: '+71239876543',
            name: 'Иван Иванов',
            avatar: "https://steamuserimages-a.akamaihd.net/ugc/2358265741743006609/9E87FE65DA1E3AD6D31936C601A18FFDA88EF2C1/?imw=512&amp;imh=288&amp;ima=fit&amp;impolicy=Letterbox&amp;imcolor=%23000000&amp;letterbox=true"
        },
        {
            userid: 4,
            username: 'manager',
            password: managerHash,
            role: 'Manager',
            email: 'manager@clinic.com',
            phoneNumber: '+70987654321',
            name: 'Менеджер',
            avatar: "https://steamuserimages-a.akamaihd.net/ugc/2358265741743006609/9E87FE65DA1E3AD6D31936C601A18FFDA88EF2C1/?imw=512&amp;imh=288&amp;ima=fit&amp;impolicy=Letterbox&amp;imcolor=%23000000&amp;letterbox=true"
        },
        {
            userid: 5,
            username: 'client2',
            password: clientHash,
            role: 'Client',
            email: 'client2@mail.ru',
            phoneNumber: '+71239876543',
            name: 'Клиент 2',
            avatar: "https://steamuserimages-a.akamaihd.net/ugc/2358265741743006609/9E87FE65DA1E3AD6D31936C601A18FFDA88EF2C1/?imw=512&amp;imh=288&amp;ima=fit&amp;impolicy=Letterbox&amp;imcolor=%23000000&amp;letterbox=true"
        }
    ]);
    await knex('users').insert([
        {
            userid: 6,
            username: 'vet',
            password: vetHash,
            role: 'Vet',
            email: 'vet@clinic.com',
            phoneNumber: '+71239876543',
            name: 'Ветеринар',
            avatar: null
        }
    ]);
    await knex('users').insert([
        {
            userid: 7,
            username: 'vet2',
            password: vetHash,
            role: 'Vet',
            email: 'vet2@clinic.com',
            phoneNumber: '+71239876543',
            name: 'Ветеринар 2',
            avatar: null
        }
    ]);
    await knex('users').insert([
        {
            userid: 8,
            username: 'vet3',
            password: vetHash,
            role: 'Vet',
            email: 'vet3@clinic.com',
            phoneNumber: '+71239876543',
            name: 'Ветеринар 3',
            avatar: null
        }
    ]);

    // 4) Настройки
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

    // 5) Шаблоны писем
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
        },
        {
            name: 'invite',
            subject: 'Приглашение в Ветеринарную клинику',
            body: 'Здравствуйте {{name}}, рады видеть вас в нашей клинике! <a href="{{inviteLink}}">Присоединиться</a>'
        }
    ]);

    // 6) Токены приглашений (оставляем vet и добавляем admin)
    await knex('invitation_tokens').insert([
        {
            token: 'invite-vet-token',
            role: 'Vet',
            email: 'newvet@clinic.com',
            used: false,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
        {
            token: 'invite-admin-token',
            role: 'Admin',
            email: 'newadmin@clinic.com',
            used: false,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
    ]);

    // 7) Баны
    await knex('user_bans').insert([
        {
            userid: 3,
            reason: 'Просроченный платёж',
            banned_at: new Date(),
            expires_at: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
            banned_by: 1
        }
    ]);

    // 8) Питомцы
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

    // 9) Расписание ветеринара
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
        },
        {
            id: 3,
            vetid: 2,
            day: '5',
            start_time: '10:00',
            end_time: '17:00',
            is_active: true
        },
        {
            id: 4,
            vetid: 2,
            day: '6',
            start_time: '10:00',
            end_time: '17:00',
            is_active: true
        }
    ]);

    // 10) Приёмы
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
    // 11) Услуги
    await knex('services').insert([
        {
            id: 1,
            name: 'Услуга 1',
            description: 'Услуга 1',
            price: 1000,
            image: 'https://i.ytimg.com/vi/e6w-EkLZbiM/maxresdefault.jpg',
            category: 'other'
        }
    ]);
    await knex('services').insert([
        {
            id: 2,
            name: 'Услуга 2',
            description: 'Услуга 2',
            price: 1000,
            image: 'https://i.ytimg.com/vi/e6w-EkLZbiM/maxresdefault.jpg',
            category: 'other'
        }
    ]);
    await knex('services').insert([
        {
            id: 3,
            name: 'Услуга 3',
            description: 'Услуга 3',
            price: 1000,
            image: 'https://i.ytimg.com/vi/e6w-EkLZbiM/maxresdefault.jpg',
            category: 'other'
        }
    ]);
    await knex('services').insert([
        {
            id: 4,
            name: 'Услуга 4',
            description: 'Услуга 4',
            price: 1000,
            image: 'https://i.ytimg.com/vi/e6w-EkLZbiM/maxresdefault.jpg',
            category: 'other'
        }
    ]);
    await knex('services').insert([
        {
            id: 5,
            name: 'Услуга 5',
            description: 'Услуга 5',
            price: 1000,
            image: 'https://i.ytimg.com/vi/e6w-EkLZbiM/maxresdefault.jpg',
            category: 'other'
        }
    ]);
};