'use strict';

export async function up(queryInterface, Sequelize) {
    await queryInterface.createTable('offer_skills', {
        id: {
            type: Sequelize.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            allowNull: false
        },
        offerId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'offers',
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
        requiredLevel: {
            type: Sequelize.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
            allowNull: false,
            defaultValue: 'beginner'
        },
        isMandatory: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: true
        },
        weight: {
            type: Sequelize.DECIMAL(3, 2),
            allowNull: true,
            defaultValue: 1.0
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
        }
    });

    // Crear índices
    await queryInterface.addIndex('offer_skills', ['offerId', 'skillId'], {
        unique: true,
        name: 'unique_offer_skill'
    });

    await queryInterface.addIndex('offer_skills', ['requiredLevel'], {
        name: 'idx_required_level'
    });

    await queryInterface.addIndex('offer_skills', ['isMandatory'], {
        name: 'idx_mandatory_skills'
    });
}

export async function down(queryInterface, Sequelize) {
    await queryInterface.dropTable('offer_skills');
}