module.exports = {
    up: async(queryInterface, Sequelize) => {
        await queryInterface.createTable('clients', {
            clientid: {
                type: Sequelize.INTEGER,
                primaryKey: true,
                autoIncrement: true,
            },
            userid: {
                type: Sequelize.INTEGER,
                references: {
                    model: 'users',
                    key: 'userid',
                },
                allowNull: false,
                onUpdate: 'CASCADE',
                onDelete: 'CASCADE'
            },
            name: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            address: {
                type: Sequelize.STRING,
            },
            phoneNumber: {
                type: Sequelize.STRING,
            },
            email: {
                type: Sequelize.STRING,
            },
        });
    },

    down: async(queryInterface, Sequelize) => {
        await queryInterface.dropTable('clients');
    }
};