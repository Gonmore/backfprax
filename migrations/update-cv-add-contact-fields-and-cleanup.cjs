'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // Agregar campos contactEmail y contactPhone a la tabla cvs
    await queryInterface.addColumn('cvs', 'contactEmail', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Email de contacto para el CV'
    });

    await queryInterface.addColumn('cvs', 'contactPhone', {
      type: Sequelize.STRING,
      allowNull: true,
      comment: 'Teléfono de contacto para el CV'
    });

    // Eliminar tablas innecesarias
    const tablesToDrop = [
      'work_experiences',
      'work_preferences',
      'academicbackgrounds', // con b minúscula
      'professional_orientations'
    ];

    for (const tableName of tablesToDrop) {
      try {
        await queryInterface.dropTable(tableName);
        console.log(`Tabla ${tableName} eliminada exitosamente`);
      } catch (error) {
        console.log(`Tabla ${tableName} no existe o ya fue eliminada:`, error.message);
      }
    }
  },

  async down(queryInterface, Sequelize) {
    // Revertir los cambios
    await queryInterface.removeColumn('cvs', 'contactEmail');
    await queryInterface.removeColumn('cvs', 'contactPhone');

    // Nota: Las tablas eliminadas no se pueden recrear automáticamente en down
    // Si se necesita rollback, habría que recrear las tablas manualmente
  }
};