'use strict';

export async function up(queryInterface, Sequelize) {
    // Primero, hacer backup de los datos existentes si los hay
    await queryInterface.sequelize.query(`
        CREATE TABLE IF NOT EXISTS cvs_backup AS
        SELECT * FROM cvs;
    `);

    // Agregar nuevas columnas
    await queryInterface.addColumn('cvs', 'studentId', {
        type: Sequelize.INTEGER,
        allowNull: true, // Temporalmente nullable para migración
        references: {
            model: 'students',
            key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
    });

    await queryInterface.addColumn('cvs', 'title', {
        type: Sequelize.STRING,
        allowNull: true
    });

    await queryInterface.addColumn('cvs', 'summary', {
        type: Sequelize.TEXT,
        allowNull: true
    });

    await queryInterface.addColumn('cvs', 'contactEmail', {
        type: Sequelize.STRING,
        allowNull: true
    });

    await queryInterface.addColumn('cvs', 'contactPhone', {
        type: Sequelize.STRING,
        allowNull: true
    });

    await queryInterface.addColumn('cvs', 'professionalOrientation', {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {}
    });

    await queryInterface.addColumn('cvs', 'academicBackground', {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
    });

    await queryInterface.addColumn('cvs', 'skills', {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
    });

    await queryInterface.addColumn('cvs', 'workExperience', {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: []
    });

    await queryInterface.addColumn('cvs', 'isComplete', {
        type: Sequelize.BOOLEAN,
        defaultValue: false
    });

    await queryInterface.addColumn('cvs', 'lastUpdated', {
        type: Sequelize.DATE,
        defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
    });

    await queryInterface.addColumn('cvs', 'availability', {
        type: Sequelize.ENUM('immediate', '1_month', '3_months', '6_months', 'flexible'),
        allowNull: true,
        defaultValue: 'flexible'
    });

    await queryInterface.addColumn('cvs', 'workPreferences', {
        type: Sequelize.JSON,
        allowNull: true,
        defaultValue: {}
    });

    // Crear índices
    await queryInterface.addIndex('cvs', ['studentId'], {
        unique: true,
        name: 'unique_student_cv'
    });

    await queryInterface.addIndex('cvs', ['isComplete'], {
        name: 'idx_cv_complete'
    });

    await queryInterface.addIndex('cvs', ['lastUpdated'], {
        name: 'idx_cv_updated'
    });

    // No cambiar el tipo de la columna id ya que puede tener datos existentes
}

export async function down(queryInterface, Sequelize) {
    // Remover nuevas columnas
    await queryInterface.removeColumn('cvs', 'studentId');
    await queryInterface.removeColumn('cvs', 'title');
    await queryInterface.removeColumn('cvs', 'summary');
    await queryInterface.removeColumn('cvs', 'contactEmail');
    await queryInterface.removeColumn('cvs', 'contactPhone');
    await queryInterface.removeColumn('cvs', 'professionalOrientation');
    await queryInterface.removeColumn('cvs', 'academicBackground');
    await queryInterface.removeColumn('cvs', 'skills');
    await queryInterface.removeColumn('cvs', 'workExperience');
    await queryInterface.removeColumn('cvs', 'isComplete');
    await queryInterface.removeColumn('cvs', 'lastUpdated');
    await queryInterface.removeColumn('cvs', 'availability');
    await queryInterface.removeColumn('cvs', 'workPreferences');

    // Restaurar datos desde backup si existen
    await queryInterface.sequelize.query(`
        INSERT INTO cvs (id, name, email, phone, file)
        SELECT id, name, email, phone, file FROM cvs_backup
        ON CONFLICT (id) DO NOTHING;
    `);

    // Eliminar tabla backup
    await queryInterface.dropTable('cvs_backup');
}