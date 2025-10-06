'use strict';

export async function up(queryInterface, Sequelize) {
    await queryInterface.createTable('cv_skills', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        cvId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'cvs',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        skillId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'skills',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        proficiencyLevel: {
            type: Sequelize.ENUM('bajo', 'medio', 'alto'),
            allowNull: false,
            defaultValue: 'medio'
        },
        yearsOfExperience: {
            type: Sequelize.DECIMAL(3, 1),
            allowNull: true,
            defaultValue: 0
        },
        isHighlighted: {
            type: Sequelize.BOOLEAN,
            defaultValue: false
        },
        notes: {
            type: Sequelize.TEXT,
            allowNull: true
        },
        createdAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        updatedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        addedAt: {
            type: Sequelize.DATE,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        }
    });

    // Crear índices
    await queryInterface.addIndex('cv_skills', ['cvId', 'skillId'], {
        unique: true,
        name: 'unique_cv_skill'
    });

    await queryInterface.addIndex('cv_skills', ['proficiencyLevel'], {
        name: 'idx_cv_skill_proficiency'
    });

    await queryInterface.addIndex('cv_skills', ['isHighlighted'], {
        name: 'idx_cv_skill_highlighted'
    });
}

export async function down(queryInterface, Sequelize) {
    await queryInterface.dropTable('cv_skills');
}