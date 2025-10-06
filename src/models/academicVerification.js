import { DataTypes } from "sequelize";
import sequelize from "../database/database.js";

export const AcademicVerification = sequelize.define('academic_verifications', {
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
    scenterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'scenters',
            key: 'id'
        }
    },
    // Información académica enviada para verificación
    academicData: {
        type: DataTypes.JSON,
        allowNull: false,
        comment: 'Datos académicos enviados: {scenter: id, profamily: id, status: string, additionalInfo?: string}'
    },
    // Estado de la verificación
    status: {
        type: DataTypes.ENUM('pending', 'approved', 'rejected'),
        allowNull: false,
        defaultValue: 'pending',
        comment: 'Estado de la verificación: pending, approved, rejected'
    },
    // Comentarios del centro de estudios
    comments: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Comentarios del centro de estudios sobre la verificación'
    },
    // Usuario que realizó la verificación (usuario del scenter)
    verifiedBy: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    // Fechas
    submittedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        comment: 'Fecha cuando el estudiante envió la solicitud'
    },
    verifiedAt: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha cuando se verificó la solicitud'
    }
}, {
    tableName: 'academic_verifications',
    indexes: [
        {
            fields: ['studentId'],
            name: 'idx_academic_verification_student'
        },
        {
            fields: ['scenterId'],
            name: 'idx_academic_verification_scenter'
        },
        {
            fields: ['status'],
            name: 'idx_academic_verification_status'
        },
        {
            fields: ['submittedAt'],
            name: 'idx_academic_verification_submitted'
        },
        {
            unique: true,
            fields: ['studentId', 'scenterId'],
            name: 'unique_student_scenter_verification',
            where: {
                status: 'pending'
            }
        }
    ]
});

export default AcademicVerification;