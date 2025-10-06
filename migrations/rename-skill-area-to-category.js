export default {
  up: async (queryInterface) => {
    // Rename column 'area' to 'category' in skills table
    await queryInterface.renameColumn('skills', 'area', 'category');
  },

  down: async (queryInterface) => {
    // Rename column 'category' back to 'area' in skills table
    await queryInterface.renameColumn('skills', 'category', 'area');
  }
};