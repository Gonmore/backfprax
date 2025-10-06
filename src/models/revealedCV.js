import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';

export const RevealedCV = sequelize.define('revealed_cvs', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'companies',
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
    revealedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    tokensUsed: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 2
    },
    revealType: {
        type: DataTypes.ENUM('intelligent_search', 'direct_search'),
        allowNull: false,
        defaultValue: 'intelligent_search'
    }
}, {
    timestamps: true,
    indexes: [
        {
            unique: true,
            fields: ['companyId', 'studentId']
        }
    ]
});