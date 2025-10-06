import { DataTypes } from "sequelize";
import sequelize from "../database/database.js";

// Modelo para la relación muchos a muchos entre Offer y Skill
export const OfferSkill = sequelize.define('offer_skills', {
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
    skillId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'skills',
            key: 'id'
        }
    },
    requiredLevel: {
        type: DataTypes.ENUM('beginner', 'intermediate', 'advanced', 'expert'),
        allowNull: false,
        defaultValue: 'beginner',
        comment: 'Nivel mínimo requerido para esta skill'
    },
    isMandatory: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        comment: 'Si la skill es obligatoria o deseable'
    },
    weight: {
        type: DataTypes.DECIMAL(3, 2),
        allowNull: true,
        defaultValue: 1.0,
        comment: 'Peso de importancia de esta skill en el matching (0.1 - 2.0)'
    },
    notes: {
        type: DataTypes.TEXT,
        allowNull: true,
        comment: 'Notas adicionales sobre los requerimientos de esta skill'
    }
}, {
    tableName: 'offer_skills',
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['offerId', 'skillId'], // Una oferta no puede requerir la misma skill duplicada
            name: 'unique_offer_skill'
        },
        {
            fields: ['requiredLevel'],
            name: 'idx_required_level'
        },
        {
            fields: ['isMandatory'],
            name: 'idx_mandatory_skills'
        }
    ]
});

export default OfferSkill;