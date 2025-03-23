exports.seed = function (knex) {
    return knex('pets').del()
        .then(function () {
            return knex('pets').insert([
                {
                    petid: 1,
                    userid: 1,
                    name: 'Нэш',
                    age: 6,
                    breed: 'Лабрадор',
                    medicalhistory: "test",
                    type: "cat",
                    gender: "male"
                },
                {
                    petid: 2,
                    userid: 1,
                    name: 'Нэш2',
                    age: 6,
                    breed: 'Лабрадор',
                    medicalhistory: "test2",
                    type: "dog",
                    gender: "male"
                },
                {
                    petid: 3,
                    userid: 1,
                    name: 'Нэш3',
                    age: 6,
                    breed: 'Лабрадор',
                    medicalhistory: "test3",
                    type: "dog",
                    gender: "female"
                }
            ]);
        });
};