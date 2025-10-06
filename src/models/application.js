import { DataTypes } from "sequelize";
import sequelize from "../database/database.js";

export const Application = sequelize.define('applications', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    offerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'offers',
            key: 'id'
        }
    },
    studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'students',
            key: 'id'
        }
    },
    status: {
        type: DataTypes.ENUM(
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
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    },
    reviewedAt: {
        type: DataTypes.DATE,
        allowNull: true
    },
    cvViewed: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Si la empresa ya vio el CV del candidato'
    },
    cvViewedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Cuándo la empresa vio el CV'
    },
    message: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Mensaje del estudiante al aplicar'
    },
    companyNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Notas internas de la empresa'
    },
    rejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Razón del rechazo si aplica'
    },
    interviewDetails: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Detalles de la entrevista en formato JSON'
    },
    interviewRequestedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Cuándo se solicitó la entrevista'
    },
    interviewConfirmedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Cuándo el estudiante confirmó la entrevista'
    },
    interviewRejectedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Cuándo el estudiante rechazó la entrevista'
    },
    interviewRejectionReason: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Razón del rechazo de la entrevista'
    },
    studentNotes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Notas adicionales del estudiante'
    }
});
