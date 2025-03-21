exports.seed = function (knex) {
    return knex('appointments').del()
        .then(function () {
            return knex('appointments').insert([
                {
                    petid: 1,
                    vetid: 5,
                    date: new Date('2023-12-01T10:00:00Z'),
                    diagnosis: "General Checkup",
                    recomendations: "Follow up in 6 months",
                    status: "scheduled"
                },
                {
                    petid: 2,
                    vetid: 5,
                    date: new Date('2023-12-02T14:00:00Z'),
                    diagnosis: "Vaccination",
                    recomendations: "Next vaccine in a year",
                    status: "cancelled"
                },
                {
                    petid: 3,
                    vetid: 5,
                    date: new Date('2023-12-05T09:00:00Z'),
                    diagnosis: "Dental Cleaning",
                    recomendations: "Follow daily dental care",
                    status: "completed"
                }
            ]);
        });
};