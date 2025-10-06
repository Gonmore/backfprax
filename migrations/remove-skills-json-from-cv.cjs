'use strict';

export async function up(queryInterface, Sequelize) {
    // Quitar el campo skills JSON de la tabla cvs
    await queryInterface.removeColumn('cvs', 'skills');
}

export async function down(queryInterface, Sequelize) {
    // Restaurar el campo skills JSON en caso de rollback
    await queryInterface.addColumn('cvs', 'skills', {
        type: Sequelize.JSON,
        allowNull: true,
        comment: 'Habilidades: [{name: string, level: "bajo|medio|alto"}]',
        defaultValue: []
    });
}