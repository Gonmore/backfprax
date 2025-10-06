import { DataTypes } from "sequelize";
import sequelize from "../database/database.js";

export const Token = sequelize.define('tokens', {
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
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Cantidad de tokens disponibles'
    },
    usedAmount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Cantidad de tokens utilizados'
    },
    purchasedAmount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Cantidad total de tokens comprados'
    },
    lastPurchaseDate: {
        type: DataTypes.DATE,
        allowNull: true,
        comment: 'Fecha de la última compra de tokens'
    }
}, {
    timestamps: true,
    indexes: [
        {
            fields: ['companyId']
        }
    ]
});