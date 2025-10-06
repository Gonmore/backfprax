import { DataTypes } from "sequelize";
import sequelize from "../database/database.js";

export const TokenTransaction = sequelize.define('token_transactions', {
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
        allowNull: true,
        references: {
            model: 'students',
            key: 'id'
        },
        comment: 'Estudiante relacionado con la transacción (si aplica)'
    },
    type: {
        type: DataTypes.ENUM('purchase', 'usage', 'refund'),
        allowNull: false,
        comment: 'Tipo de transacción: compra, uso o reembolso'
    },
    action: {
        type: DataTypes.ENUM('view_cv', 'contact_student', 'buy_tokens'),
        allowNull: true,
        comment: 'Acción específica que consumió tokens'
    },
    amount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Cantidad de tokens (positiva para compras, negativa para usos)'
    },
    description: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Descripción de la transacción'
    },
    balanceAfter: {
        type: DataTypes.INTEGER,
        allowNull: false,
        comment: 'Balance de tokens después de la transacción'
    }
}, {
    timestamps: true,
    indexes: [
        {
            fields: ['companyId', 'createdAt']
        },
        {
            fields: ['type']
        }
    ]
});