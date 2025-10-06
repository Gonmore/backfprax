import { DataTypes } from "sequelize"
import sequelize from "../database/database.js"

export const ScenterProfamily = sequelize.define('scenter_profamilys', {
    id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        allowNull: false
    },
    scenterId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'scenters',
            key: 'id'
        }
    },
    profamilyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'profamilys',
            key: 'id'
        }
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: DataTypes.NOW
    }
})