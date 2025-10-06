import { DataTypes } from "sequelize";
import sequelize from "../database/database.js";

export const StudentToken = sequelize.define('student_tokens', {
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
    pendingPayment: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Cantidad pendiente por pagar si es contratado'
    },
    totalEarned: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false,
        defaultValue: 0.00,
        comment: 'Total ganado por contrataciones'
    },
    contractCount: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        comment: 'Número de veces contratado'
    }
}, {
    timestamps: true,
    indexes: [
        {
            fields: ['studentId']
        }
    ]
});