import { DataTypes } from "sequelize";
import sequelize from "../database/database.js";

// Modelo para la relación muchos a muchos entre Student y Skill
export const StudentSkill = sequelize.define('student_skills', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    studentId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'students',
            key: 'id'
        }
    },
    skillId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'skills',
            key: 'id'
        }
    },
    proficiencyLevel: {
        type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
        allowNull: false,
        defaultValue: 'beginner'
    },
    yearsOfExperience: {
        type: DataTypes.DECIMAL(3, 1), // Permite valores como 1.5 años
        allowNull: true,
        defaultValue: 0,
        comment: 'Años de experiencia en esta habilidad'
    },
    isVerified: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Si la habilidad ha sido verificada por el centro educativo'
    },
    certificationUrl: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'URL a certificación o evidencia de la habilidad'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Notas adicionales sobre la experiencia en esta habilidad'
    },
    addedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        comment: 'Fecha cuando se agregó la habilidad'
    },
    lastUpdated: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        comment: 'Última actualización de la habilidad'
    }
}, {
    tableName: 'student_skills',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['studentId', 'skillId'], // Un estudiante no puede tener la misma skill duplicada
            name: 'unique_student_skill'
        },
        {
            fields: ['proficiencyLevel'],
            name: 'idx_proficiency_level'
        },
        {
            fields: ['isVerified'],
            name: 'idx_verified_skills'
        }
    ],
    hooks: {
        beforeUpdate: (studentSkill, options) => {
            studentSkill.lastUpdated = new Date();
        }
    }
});

export default StudentSkill;