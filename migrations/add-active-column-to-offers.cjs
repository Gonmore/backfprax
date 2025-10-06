export default {
  up: async (queryInterface, Sequelize) => {
    // Add active column to offers table
    await queryInterface.addColumn('offers', 'active', {
      type: Sequelize.BOOLEAN,
      defaultValue: true,
      allowNull: false
    });
  },

  down: async (queryInterface, Sequelize) => {
    // Remove active column from offers table
    await queryInterface.removeColumn('offers', 'active');
  }
};