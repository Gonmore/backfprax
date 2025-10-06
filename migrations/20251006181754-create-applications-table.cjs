'use strict';

export async function up(queryInterface, Sequelize) {
    await queryInterface.createTable('applications', {
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
        studentId: {
            type: Sequelize.INTEGER,
            allowNull: false,
            references: {
                model: 'students',
                key: 'id'
            },
            onUpdate: 'CASCADE',
            onDelete: 'CASCADE'
        },
        status: {
            type: Sequelize.ENUM(
                'pending',
                'reviewed',
                'interview_requested',
                'interview_confirmed',
                'interview_rejected',
                'accepted',
                'rejected',
                'withdrawn'
            ),
            allowNull: false,
            defaultValue: 'pending'
        },
        appliedAt: {
            type: Sequelize.DATE,
            allowNull: false,
            defaultValue: Sequelize.literal('CURRENT_TIMESTAMP')
        },
        reviewedAt: {
            type: Sequelize.DATE,
            allowNull: true
        },
        cvViewed: {
            type: Sequelize.BOOLEAN,
            allowNull: false,
            defaultValue: false,
            comment: 'Si la empresa ya vio el CV del candidato'
        },
        cvViewedAt: {
            type: Sequelize.DATE,
            allowNull: true,
            comment: 'Cuándo la empresa vio el CV'
        },
        message: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'Mensaje del estudiante al aplicar'
        },
        companyNotes: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'Notas internas de la empresa'
        },
        rejectionReason: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'Razón del rechazo si aplica'
        },
        interviewDetails: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'Detalles de la entrevista en formato JSON'
        },
        interviewRequestedAt: {
            type: Sequelize.DATE,
            allowNull: true,
            comment: 'Cuándo se solicitó la entrevista'
        },
        interviewConfirmedAt: {
            type: Sequelize.DATE,
            allowNull: true,
            comment: 'Cuándo el estudiante confirmó la entrevista'
        },
        interviewRejectedAt: {
            type: Sequelize.DATE,
            allowNull: true,
            comment: 'Cuándo el estudiante rechazó la entrevista'
        },
        interviewRejectionReason: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'Razón del rechazo de la entrevista'
        },
        studentNotes: {
            type: Sequelize.TEXT,
            allowNull: true,
            comment: 'Notas adicionales del estudiante'
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
    await queryInterface.addIndex('applications', ['offerId'], {
        name: 'idx_applications_offer'
    });

    await queryInterface.addIndex('applications', ['studentId'], {
        name: 'idx_applications_student'
    });

    await queryInterface.addIndex('applications', ['status'], {
        name: 'idx_applications_status'
    });

    await queryInterface.addIndex('applications', ['appliedAt'], {
        name: 'idx_applications_applied_at'
    });
}

export async function down(queryInterface, Sequelize) {
    await queryInterface.dropTable('applications');
}