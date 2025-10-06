import { DataTypes } from "sequelize";
import sequelize from "../database/database.js";

// Modelo para la relación muchos a muchos entre Cv y Skill
export const CvSkill = sequelize.define('cv_skills', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    cvId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'cvs',
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
        type: DataTypes.ENUM('bajo', 'medio', 'alto'),
        allowNull: false,
        defaultValue: 'medio',
        comment: 'Nivel de conocimiento: bajo, medio, alto'
    },
    yearsOfExperience: {
        type: DataTypes.DECIMAL(3, 1), // Permite valores como 1.5 años
        allowNull: true,
        defaultValue: 0,
        comment: 'Años de experiencia en esta habilidad'
    },
    isHighlighted: {
        type: DataTypes.BOOLEAN,
        defaultValue: false,
        comment: 'Si esta habilidad debe destacarse en el CV'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Notas adicionales sobre la experiencia en esta habilidad'
    },
    addedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
        comment: 'Fecha cuando se agregó la habilidad al CV'
    }
}, {
    tableName: 'cv_skills',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['cvId', 'skillId'], // Un CV no puede tener la misma skill duplicada
            name: 'unique_cv_skill'
        },
        {
            fields: ['proficiencyLevel'],
            name: 'idx_cv_skill_proficiency'
        },
        {
            fields: ['isHighlighted'],
            name: 'idx_cv_skill_highlighted'
        }
    ]
});

export default CvSkill;