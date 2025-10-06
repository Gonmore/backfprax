import { DataTypes } from 'sequelize';
import sequelize from '../database/database.js';

const UserCompany = sequelize.define('UserCompany', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'companies',
            key: 'id'
        }
    },
    role: {
        type: DataTypes.ENUM('admin', 'manager', 'hr', 'viewer'),
        allowNull: false,
        defaultValue: 'admin'
    },
    isActive: {
        type: DataTypes.BOOLEAN,
        defaultValue: true
    },
    assignedAt: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW
    }
}, {
    tableName: 'user_companies',
    timestamps: true
});

export default UserCompany;