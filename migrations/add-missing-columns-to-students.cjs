'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn('students', 'course', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('students', 'tag', {
      type: Sequelize.STRING,
      allowNull: true
    });

    await queryInterface.addColumn('students', 'profamilyId', {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: 'profamilys',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    });
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn('students', 'profamilyId');
    await queryInterface.removeColumn('students', 'tag');
    await queryInterface.removeColumn('students', 'course');
  }
};