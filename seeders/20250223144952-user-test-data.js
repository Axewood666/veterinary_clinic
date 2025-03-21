exports.seed = async function (knex) {
    await knex('appointments').del();
    await knex('pets').del();
    await knex('users').del();

    await knex('users').insert([
        {
            userid: 1,
            username: 'johndoe',
            password: 'testPass',
            role: 'Client',
            email: 'johndoe@example.com',
            name: "test"
        },
        {
            userid: 2,
            username: 'janedoe',
            password: 'testPass2',
            role: 'Client',
            email: 'janedoe@example.com',
            name: "test"
        },
        {
            userid: 3,
            username: "axewood",
            password: "$2b$10$88B9ijNM8UvGmY7IrSHGC.TKB1edXrgj5hJYakG3ZOyATMe7lZD1a",
            role: 'Admin',
            email: "test@mail.ru",
            phoneNumber: "8555353352",
            name: "test"
        },
        {
            userid: 4,
            username: "axewood Client",
            password: "$2b$10$L7BgfQWWvbwULBVqbrFygOJ0hZA05vTATWHGHUMg8RAgtdLIGLWle",
            role: 'Client',
            email: "test2@mail.ru",
            phoneNumber: "8917929122",
            name: "test"
        },
        {
            userid: 5,
            username: "axewoodVet",
            password: "$2b$10$L7BgfQWWvbwULBVqbrFygOJ0hZA05vTATWHGHUMg8RAgtdLIGLWle",
            role: 'Vet',
            email: "test5@mail.ru",
            phoneNumber: "8917929122",
            name: "test"
        }
    ]);
};