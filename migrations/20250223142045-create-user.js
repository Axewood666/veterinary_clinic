module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.createTable('users', {
            userid: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            username: {
                type: Sequelize.STRING,
                unique: true,
                allowNull: false,
            },
            password: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            role: {
                type: Sequelize.ENUM('Admin', 'Vet', 'Client'),
                allowNull: false,
            },
            email: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            phoneNumber: {
                type: Sequelize.STRING,
            },
            name: {
                type: Sequelize.STRING
            }
        });
    },

    down: async(queryInterface, Sequelize) => {
        await queryInterface.dropTable('users');
    }
};