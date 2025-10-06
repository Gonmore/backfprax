import { DataTypes } from "sequelize"
import sequelize from "../database/database.js"

export const Cv = sequelize.define('cvs', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false,
    },
    studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'students',
            key: 'id'
        }
    },
    // Información básica del CV
    summary: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Resumen profesional del estudiante'
    },

    // Información de contacto (copiada del usuario)
    contactEmail: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Email de contacto (copiado del usuario)'
    },

    contactPhone: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Teléfono de contacto (copiado del usuario)'
    },

    // Archivo del CV (opcional, para CVs subidos)
    file: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Ruta al archivo PDF del CV'
    },

    // Información académica para práctica profesional (SOLO UNA carrera)
    academicBackground: {
        type: DataTypes.JSON,
        allowNull: true,
        comment: 'Información académica para práctica: {scenter: id, profamily: id, status: "titulado|egresado|por_egresar"}',
        defaultValue: null
    },

    // Estado de verificación académica
    academicVerificationStatus: {
        type: DataTypes.ENUM('unverified', 'pending', 'verified', 'rejected'),
        allowNull: false,
        defaultValue: 'unverified',
        comment: 'Estado de verificación de la información académica: unverified, pending, verified, rejected'
    },

    academicVerifiedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha cuando se verificó la información académica'
    },

    academicVerifiedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        },
        comment: 'Usuario que verificó la información académica'
    },

    // Habilidades con niveles de conocimiento - REMOVIDO: ahora se maneja con CvSkill
    // skills: {
    //     type: DataTypes.JSON,
    //     allowNull: true,
    //     comment: 'Habilidades: [{name: string, level: "bajo|medio|alto"}]',
    //     defaultValue: []
    // },

    // Metadatos
    isComplete: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Indica si el CV está completo para matching'
    },

    lastUpdated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        comment: 'Última vez que se actualizó el CV'
    },

    // Preferencias de matching
    availability: {
        type: DataTypes.ENUM('immediate', '1_month', '3_months', '6_months', 'flexible'),
        allowNull: true,
        defaultValue: 'flexible'
    }
}, {
    tableName: 'cvs',
    indexes: [
        {
            unique: true,
            fields: ['studentId'],
            name: 'unique_student_cv'
        },
        {
            fields: ['isComplete'],
            name: 'idx_cv_complete'
        },
        {
            fields: ['lastUpdated'],
            name: 'idx_cv_updated'
        }
    ]
});