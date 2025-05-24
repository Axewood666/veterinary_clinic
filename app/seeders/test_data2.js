const bcrypt = require('bcrypt');

exports.seed = async function (knex) {
    await knex('appointments').del();
    await knex('vet_schedules').del();
    await knex('pets').del();
    await knex('user_bans').del();
    await knex('invitation_tokens').del();
    await knex('email_templates').del();
    await knex('settings').del();
    await knex('users').del();
    await knex('services').del();

    const saltRounds = 10;
    const [adminHash, vetHash, clientHash, managerHash] = await Promise.all([
        bcrypt.hash('admin123', saltRounds),
        bcrypt.hash('vet123', saltRounds),
        bcrypt.hash('client123', saltRounds),
        bcrypt.hash('manager123', saltRounds),
    ]);

    await knex('users').insert([
        {
            userid: 1,
            username: 'admin',
            password: adminHash,
            role: 'Admin',
            email: 'admin@vetclinic.ru',
            phoneNumber: '+7-495-123-45-67',
            name: 'Анна Петровна Администраторова',
            avatar: "https://images.unsplash.com/photo-1494790108755-2616c448be78?w=200&h=200&fit=crop&crop=face"
        },
        {
            userid: 2,
            username: 'dr_vasin',
            password: vetHash,
            role: 'Vet',
            email: 'vasin@vetclinic.ru',
            phoneNumber: '+7-985-234-56-78',
            name: 'Василий Иванович Васин',
            avatar: "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop&crop=face"
        },
        {
            userid: 3,
            username: 'dr_petrova',
            password: vetHash,
            role: 'Vet',
            email: 'petrova@vetclinic.ru',
            phoneNumber: '+7-926-345-67-89',
            name: 'Елена Сергеевна Петрова',
            avatar: "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop&crop=face"
        },
        {
            userid: 4,
            username: 'dr_smirnov',
            password: vetHash,
            role: 'Vet',
            email: 'smirnov@vetclinic.ru',
            phoneNumber: '+7-903-456-78-90',
            name: 'Дмитрий Александрович Смирнов',
            avatar: "https://images.unsplash.com/photo-1582750433449-648ed127bb54?w=200&h=200&fit=crop&crop=face"
        },
        {
            userid: 5,
            username: 'dr_koroleva',
            password: vetHash,
            role: 'Vet',
            email: 'koroleva@vetclinic.ru',
            phoneNumber: '+7-916-567-89-01',
            name: 'Мария Викторовна Королева',
            avatar: "https://images.unsplash.com/photo-1614608682850-e0d6ed316d47?w=200&h=200&fit=crop&crop=face"
        },
        {
            userid: 6,
            username: 'manager_anna',
            password: managerHash,
            role: 'Manager',
            email: 'manager.anna@vetclinic.ru',
            phoneNumber: '+7-495-234-56-78',
            name: 'Анна Михайловна Менеджерова',
            avatar: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=200&h=200&fit=crop&crop=face"
        },
        {
            userid: 7,
            username: 'ivanov_ivan',
            password: clientHash,
            role: 'Client',
            email: 'ivanov.ivan@mail.ru',
            phoneNumber: '+7-911-123-45-67',
            name: 'Иван Иванович Иванов',
            avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face"
        },
        {
            userid: 8,
            username: 'sidorova_maria',
            password: clientHash,
            role: 'Client',
            email: 'sidorova.maria@gmail.com',
            phoneNumber: '+7-925-234-56-78',
            name: 'Мария Петровна Сидорова',
            avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=200&h=200&fit=crop&crop=face"
        },
        {
            userid: 9,
            username: 'kozlov_sergey',
            password: clientHash,
            role: 'Client',
            email: 'kozlov.sergey@yandex.ru',
            phoneNumber: '+7-916-345-67-89',
            name: 'Сергей Александрович Козлов',
            avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face"
        },
        {
            userid: 10,
            username: 'popova_olga',
            password: clientHash,
            role: 'Client',
            email: 'popova.olga@mail.ru',
            phoneNumber: '+7-903-456-78-90',
            name: 'Ольга Викторовна Попова',
            avatar: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=200&h=200&fit=crop&crop=face"
        },
        {
            userid: 11,
            username: 'petrov_alex',
            password: clientHash,
            role: 'Client',
            email: 'petrov.alex@gmail.com',
            phoneNumber: '+7-926-567-89-01',
            name: 'Алексей Дмитриевич Петров',
            avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&h=200&fit=crop&crop=face"
        },
        {
            userid: 12,
            username: 'volkova_elena',
            password: clientHash,
            role: 'Client',
            email: 'volkova.elena@yandex.ru',
            phoneNumber: '+7-915-678-90-12',
            name: 'Елена Андреевна Волкова',
            avatar: "https://images.unsplash.com/photo-1494790108755-2616c448be78?w=200&h=200&fit=crop&crop=face"
        },
        {
            userid: 13,
            username: 'sokolov_dmitry',
            password: clientHash,
            role: 'Client',
            email: 'sokolov.dmitry@mail.ru',
            phoneNumber: '+7-909-789-01-23',
            name: 'Дмитрий Сергеевич Соколов',
            avatar: "https://images.unsplash.com/photo-1519244703995-f4e0f30006d5?w=200&h=200&fit=crop&crop=face"
        },
        {
            userid: 14,
            username: 'novikova_anya',
            password: clientHash,
            role: 'Client',
            email: 'novikova.anya@gmail.com',
            phoneNumber: '+7-917-890-12-34',
            name: 'Анна Игоревна Новикова',
            avatar: "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=200&h=200&fit=crop&crop=face"
        },
        {
            userid: 15,
            username: 'fedorov_pavel',
            password: clientHash,
            role: 'Client',
            email: 'fedorov.pavel@yandex.ru',
            phoneNumber: '+7-925-901-23-45',
            name: 'Павел Николаевич Федоров',
            avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=200&h=200&fit=crop&crop=face"
        }
    ]);

    await knex('settings').insert({
        clinic_name: 'ВетКлиника "Добрый Доктор"',
        address: 'г. Москва, ул. Ветеринарная, д. 15, корп. 2',
        phone: '+7 (495) 123-45-67',
        email: 'info@dobryj-doktor.ru',
        working_hours: '8:00-20:00 (Пн-Пт), 9:00-18:00 (Сб-Вс)',
        appointment_duration: 30,
        website: 'https://dobryj-doktor.ru',
        logo_url: 'https://dobryj-doktor.ru/assets/logo.png'
    });

    await knex('email_templates').insert([
        {
            name: 'welcome',
            subject: 'Добро пожаловать в ВетКлинику "Добрый Доктор"',
            body: 'Здравствуйте, {{name}}! Рады приветствовать вас в нашей ветеринарной клинике. Мы заботимся о здоровье ваших питомцев уже более 10 лет!'
        },
        {
            name: 'appointment_reminder',
            subject: 'Напоминание о приёме в ВетКлинике',
            body: 'Уважаемый {{name}}, напоминаем о записи на приём {{date}} в {{time}}. Ждём вас и вашего питомца в нашей клинике!'
        },
        {
            name: 'invite',
            subject: 'Приглашение к работе в ВетКлинике "Добрый Доктор"',
            body: 'Здравствуйте, {{name}}! Приглашаем вас присоединиться к команде нашей ветеринарной клиники. <a href="{{inviteLink}}">Завершить регистрацию</a>'
        },
        {
            name: 'appointment_confirmation',
            subject: 'Подтверждение записи на приём',
            body: 'Здравствуйте, {{name}}! Ваша запись на {{date}} в {{time}} подтверждена. При себе иметь паспорт и ветеринарный паспорт питомца.'
        }
    ]);

    await knex('invitation_tokens').insert([
        {
            token: 'invite-vet-specialist-2024',
            role: 'Vet',
            email: 'new.vet@vetclinic.ru',
            name: 'Новый Ветеринар',
            used: false,
            expires_at: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
        {
            token: 'invite-admin-assistant-2024',
            role: 'Admin',
            email: 'assistant@vetclinic.ru',
            name: 'Помощник Администратора',
            used: false,
            expires_at: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        }
    ]);

    await knex('pets').insert([
        {
            petid: 1,
            userid: 7,
            name: 'Барсик',
            breed: 'Сибирская кошка',
            age: 3,
            medicalhistory: 'Стерилизация в 2022г. Аллергия на курицу. Регулярные осмотры.',
            type: 'cat',
            gender: 'male'
        },
        {
            petid: 2,
            userid: 7,
            name: 'Мурка',
            breed: 'Британская короткошёрстная',
            age: 2,
            medicalhistory: 'Здорова. Профилактические прививки по графику.',
            type: 'cat',
            gender: 'female'
        },
        {
            petid: 3,
            userid: 8,
            name: 'Шарик',
            breed: 'Лабрадор-ретривер',
            age: 5,
            medicalhistory: 'Дисплазия тазобедренных суставов. Регулярное наблюдение.',
            type: 'dog',
            gender: 'male'
        },
        {
            petid: 4,
            userid: 9,
            name: 'Белка',
            breed: 'Джек-рассел-терьер',
            age: 1,
            medicalhistory: 'Щенок. Проведена первичная вакцинация.',
            type: 'dog',
            gender: 'female'
        },
        {
            petid: 5,
            userid: 10,
            name: 'Рыжик',
            breed: 'Персидская кошка',
            age: 7,
            medicalhistory: 'Хроническое заболевание почек. Специальная диета.',
            type: 'cat',
            gender: 'male'
        },
        {
            petid: 6,
            userid: 11,
            name: 'Тузик',
            breed: 'Немецкая овчарка',
            age: 4,
            medicalhistory: 'Здоров. Рабочая собака, регулярные физические нагрузки.',
            type: 'dog',
            gender: 'male'
        },
        {
            petid: 7,
            userid: 12,
            name: 'Кеша',
            breed: 'Волнистый попугай',
            age: 2,
            medicalhistory: 'Здоров. Плановые осмотры.',
            type: 'bird',
            gender: 'male'
        },
        {
            petid: 8,
            userid: 13,
            name: 'Дружок',
            breed: 'Спаниель',
            age: 6,
            medicalhistory: 'Отит в анамнезе. Регулярная чистка ушей.',
            type: 'dog',
            gender: 'male'
        },
        {
            petid: 9,
            userid: 14,
            name: 'Лапочка',
            breed: 'Мейн-кун',
            age: 3,
            medicalhistory: 'Здорова. Крупная порода, контроль веса.',
            type: 'cat',
            gender: 'female'
        },
        {
            petid: 10,
            userid: 15,
            name: 'Хомяк',
            breed: 'Джунгарский хомяк',
            age: 1,
            medicalhistory: 'Здоров. Профилактический осмотр.',
            type: 'other',
            gender: 'male'
        },
        {
            petid: 11,
            userid: 8,
            name: 'Граф',
            breed: 'Доберман',
            age: 8,
            medicalhistory: 'Возрастные изменения суставов. Поддерживающая терапия.',
            type: 'dog',
            gender: 'male'
        },
        {
            petid: 12,
            userid: 9,
            name: 'Принцесса',
            breed: 'Йоркширский терьер',
            age: 4,
            medicalhistory: 'Проблемы с зубами. Регулярная санация ротовой полости.',
            type: 'dog',
            gender: 'female'
        }
    ]);

    await knex('vet_schedules').insert([
        {
            id: 1,
            vetid: 2,
            day: '1',
            start_time: '08:00',
            end_time: '16:00',
            is_active: true
        },
        {
            id: 2,
            vetid: 2,
            day: '2',
            start_time: '08:00',
            end_time: '16:00',
            is_active: true
        },
        {
            id: 3,
            vetid: 2,
            day: '3',
            start_time: '08:00',
            end_time: '16:00',
            is_active: true
        },
        {
            id: 4,
            vetid: 2,
            day: '4',
            start_time: '12:00',
            end_time: '20:00',
            is_active: true
        },
        {
            id: 5,
            vetid: 2,
            day: '5',
            start_time: '12:00',
            end_time: '20:00',
            is_active: true
        },
        {
            id: 6,
            vetid: 3,
            day: '1',
            start_time: '09:00',
            end_time: '17:00',
            is_active: true
        },
        {
            id: 7,
            vetid: 3,
            day: '2',
            start_time: '09:00',
            end_time: '17:00',
            is_active: true
        },
        {
            id: 8,
            vetid: 3,
            day: '3',
            start_time: '09:00',
            end_time: '17:00',
            is_active: true
        },
        {
            id: 9,
            vetid: 3,
            day: '6',
            start_time: '10:00',
            end_time: '16:00',
            is_active: true
        },
        {
            id: 10,
            vetid: 4,
            day: '2',
            start_time: '10:00',
            end_time: '18:00',
            is_active: true
        },
        {
            id: 11,
            vetid: 4,
            day: '4',
            start_time: '08:00',
            end_time: '16:00',
            is_active: true
        },
        {
            id: 12,
            vetid: 4,
            day: '5',
            start_time: '08:00',
            end_time: '16:00',
            is_active: true
        },
        {
            id: 13,
            vetid: 4,
            day: '6',
            start_time: '09:00',
            end_time: '15:00',
            is_active: true
        },
        {
            id: 14,
            vetid: 5,
            day: '1',
            start_time: '12:00',
            end_time: '20:00',
            is_active: true
        },
        {
            id: 15,
            vetid: 5,
            day: '3',
            start_time: '12:00',
            end_time: '20:00',
            is_active: true
        },
        {
            id: 16,
            vetid: 5,
            day: '5',
            start_time: '12:00',
            end_time: '20:00',
            is_active: true
        },
        {
            id: 17,
            vetid: 5,
            day: '7',
            start_time: '10:00',
            end_time: '18:00',
            is_active: true
        }
    ]);

    await knex('services').insert([
        {
            id: 1,
            name: 'Первичный осмотр',
            description: 'Комплексный осмотр животного с составлением плана лечения',
            price: 1500,
            image: 'https://images.unsplash.com/photo-1551717743-49959800b1f6?w=400&h=300&fit=crop',
            category: 'consultation'
        },
        {
            id: 2,
            name: 'Повторный осмотр',
            description: 'Контрольный осмотр в рамках лечения',
            price: 1000,
            image: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=400&h=300&fit=crop',
            category: 'consultation'
        },
        {
            id: 3,
            name: 'Вакцинация комплексная',
            description: 'Комплексная вакцинация от основных заболеваний',
            price: 2500,
            image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
            category: 'vaccination'
        },
        {
            id: 4,
            name: 'Вакцинация от бешенства',
            description: 'Обязательная вакцинация от бешенства',
            price: 800,
            image: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=400&h=300&fit=crop',
            category: 'vaccination'
        },
        {
            id: 5,
            name: 'Стерилизация кошки',
            description: 'Плановая стерилизация кошки с послеоперационным уходом',
            price: 8000,
            image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400&h=300&fit=crop',
            category: 'surgery'
        },
        {
            id: 6,
            name: 'Кастрация кота',
            description: 'Плановая кастрация кота',
            price: 5000,
            image: 'https://images.unsplash.com/photo-1573865526739-10659fec78a5?w=400&h=300&fit=crop',
            category: 'surgery'
        },
        {
            id: 7,
            name: 'Стерилизация собаки',
            description: 'Плановая стерилизация собаки (до 25 кг)',
            price: 12000,
            image: 'https://images.unsplash.com/photo-1552053831-71594a27632d?w=400&h=300&fit=crop',
            category: 'surgery'
        },
        {
            id: 8,
            name: 'УЗИ брюшной полости',
            description: 'Ультразвуковое исследование органов брюшной полости',
            price: 3000,
            image: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=400&h=300&fit=crop',
            category: 'diagnostics'
        },
        {
            id: 9,
            name: 'Рентген (1 проекция)',
            description: 'Рентгенологическое исследование (одна проекция)',
            price: 2000,
            image: 'https://images.unsplash.com/photo-1551190822-a9333d879b1f?w=400&h=300&fit=crop',
            category: 'diagnostics'
        },
        {
            id: 10,
            name: 'Анализ крови общий',
            description: 'Общий клинический анализ крови',
            price: 1200,
            image: 'https://images.unsplash.com/photo-1582719471137-c3967ffb1c42?w=400&h=300&fit=crop',
            category: 'laboratory'
        },
        {
            id: 11,
            name: 'Биохимический анализ крови',
            description: 'Биохимическое исследование крови (базовая панель)',
            price: 2800,
            image: 'https://images.unsplash.com/photo-1584432743501-7d5c27a39189?w=400&h=300&fit=crop',
            category: 'laboratory'
        },
        {
            id: 12,
            name: 'Санация ротовой полости',
            description: 'Профессиональная чистка зубов с удалением зубного камня',
            price: 4500,
            image: 'https://images.unsplash.com/photo-1606250942824-c6e8c5e0c8c3?w=400&h=300&fit=crop',
            category: 'dental'
        },
        {
            id: 13,
            name: 'Удаление зуба простое',
            description: 'Удаление молочного или подвижного зуба',
            price: 1500,
            image: 'https://images.unsplash.com/photo-1609840114035-3c981b782dfe?w=400&h=300&fit=crop',
            category: 'dental'
        },
        {
            id: 14,
            name: 'Удаление зуба сложное',
            description: 'Хирургическое удаление коренного зуба',
            price: 3500,
            image: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=400&h=300&fit=crop',
            category: 'dental'
        },
        {
            id: 15,
            name: 'Стрижка когтей',
            description: 'Подрезание когтей с обработкой',
            price: 500,
            image: 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400&h=300&fit=crop',
            category: 'grooming'
        },
        {
            id: 16,
            name: 'Чистка ушей',
            description: 'Профессиональная чистка ушей с лечебными растворами',
            price: 800,
            image: 'https://images.unsplash.com/photo-1583337130417-3346a1be7dee?w=400&h=300&fit=crop',
            category: 'grooming'
        },
        {
            id: 17,
            name: 'Груминг полный (маленькие породы)',
            description: 'Полный комплекс груминга для собак до 10 кг',
            price: 3500,
            image: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=400&h=300&fit=crop',
            category: 'grooming'
        },
        {
            id: 18,
            name: 'Груминг полный (крупные породы)',
            description: 'Полный комплекс груминга для собак свыше 25 кг',
            price: 6000,
            image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=400&h=300&fit=crop',
            category: 'grooming'
        },
        {
            id: 19,
            name: 'Капельница (1 процедура)',
            description: 'Внутривенное введение лекарственных препаратов',
            price: 1800,
            image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?w=400&h=300&fit=crop',
            category: 'treatment'
        },
        {
            id: 20,
            name: 'Инъекция внутримышечная',
            description: 'Внутримышечное введение препарата',
            price: 300,
            image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=300&fit=crop',
            category: 'treatment'
        }
    ]);

    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dayAfterTomorrow = new Date(today);
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 2);

    await knex('appointments').insert([
        {
            appointmentid: 1,
            petid: 1,
            vetid: 2,
            comment: 'Плановый осмотр и вакцинация',
            diagnosis: null,
            recomendations: null,
            status: 'scheduled',
            type: 'vaccination',
            clientId: 7,
            time: '09:00',
            date: tomorrow
        },
        {
            appointmentid: 2,
            petid: 3,
            vetid: 3,
            comment: 'Хромота на заднюю лапу',
            diagnosis: 'Растяжение связок',
            recomendations: 'Покой 2 недели, противовоспалительные препараты',
            status: 'completed',
            type: 'consultation',
            clientId: 8,
            time: '10:30',
            date: today
        },
        {
            appointmentid: 3,
            petid: 5,
            vetid: 4,
            comment: 'Контрольный осмотр почек',
            diagnosis: null,
            recomendations: null,
            status: 'scheduled',
            type: 'consultation',
            clientId: 10,
            time: '14:00',
            date: tomorrow
        },
        {
            appointmentid: 4,
            petid: 7,
            vetid: 5,
            comment: 'Профилактический осмотр птицы',
            diagnosis: 'Здоров',
            recomendations: 'Плановый осмотр через 6 месяцев',
            status: 'completed',
            type: 'consultation',
            clientId: 12,
            time: '16:00',
            date: today
        },
        {
            appointmentid: 5,
            petid: 9,
            vetid: 2,
            comment: 'Стерилизация',
            diagnosis: null,
            recomendations: null,
            status: 'scheduled',
            type: 'other',
            clientId: 14,
            time: '11:00',
            date: dayAfterTomorrow
        },
        {
            appointmentid: 6,
            petid: 4,
            vetid: 3,
            comment: 'Повторная вакцинация щенка',
            diagnosis: null,
            recomendations: null,
            status: 'scheduled',
            type: 'vaccination',
            clientId: 9,
            time: '15:30',
            date: tomorrow
        },
        {
            appointmentid: 7,
            petid: 12,
            vetid: 4,
            comment: 'Санация ротовой полости',
            diagnosis: 'Зубной камень, гингивит',
            recomendations: 'Регулярная чистка зубов дома',
            status: 'completed',
            type: 'other',
            clientId: 9,
            time: '12:00',
            date: today
        },
        {
            appointmentid: 8,
            petid: 6,
            vetid: 5,
            comment: 'УЗИ брюшной полости',
            diagnosis: null,
            recomendations: null,
            status: 'scheduled',
            type: 'other',
            clientId: 11,
            time: '17:00',
            date: dayAfterTomorrow
        }
    ]);

    await knex('user_bans').insert([
        {
            userid: 13,
            reason: 'Неподобающее поведение с персоналом',
            banned_at: new Date(),
            expires_at: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
            banned_by: 1
        }
    ]);
};