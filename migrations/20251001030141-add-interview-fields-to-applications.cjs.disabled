'use strict';

/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up (queryInterface, Sequelize) {
    // Agregar nuevos estados al ENUM de status
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_applications_status" ADD VALUE IF NOT EXISTS 'interview_confirmed';
    `);
    await queryInterface.sequelize.query(`
      ALTER TYPE "enum_applications_status" ADD VALUE IF NOT EXISTS 'interview_rejected';
    `);

    // Agregar nuevos campos
    await queryInterface.addColumn('applications', 'interviewDetails', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Detalles de la entrevista en formato JSON'
    });

    await queryInterface.addColumn('applications', 'interviewRequestedAt', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Cuándo se solicitó la entrevista'
    });

    await queryInterface.addColumn('applications', 'interviewConfirmedAt', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Cuándo el estudiante confirmó la entrevista'
    });

    await queryInterface.addColumn('applications', 'interviewRejectedAt', {
      type: Sequelize.DATE,
      allowNull: true,
      comment: 'Cuándo el estudiante rechazó la entrevista'
    });

    await queryInterface.addColumn('applications', 'interviewRejectionReason', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Razón del rechazo de la entrevista'
    });

    await queryInterface.addColumn('applications', 'studentNotes', {
      type: Sequelize.TEXT,
      allowNull: true,
      comment: 'Notas adicionales del estudiante'
    });
  },

  async down (queryInterface, Sequelize) {
    // Remover los nuevos campos
    await queryInterface.removeColumn('applications', 'studentNotes');
    await queryInterface.removeColumn('applications', 'interviewRejectionReason');
    await queryInterface.removeColumn('applications', 'interviewRejectedAt');
    await queryInterface.removeColumn('applications', 'interviewConfirmedAt');
    await queryInterface.removeColumn('applications', 'interviewRequestedAt');
    await queryInterface.removeColumn('applications', 'interviewDetails');

    // Nota: No podemos remover valores de un ENUM en PostgreSQL fácilmente,
    // pero como esta es una migración down, asumimos que se revertirá completamente
  }
};
