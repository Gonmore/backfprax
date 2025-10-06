import { DataTypes } from "sequelize"
import sequelize from "../database/database.js"

export const Tutor = sequelize.define('tutors', {
    id: {
        type: DataTypes.STRING,
        primaryKey: true,
        allowNull: false,
        },
    tutorId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'scenters',
            key: 'id'
        }
    },
    name:{type: DataTypes.STRING,allowNull: true},
    email:{type: DataTypes.STRING,allowNull: true},
    grade:{type: DataTypes.STRING,allowNull: true},
    degree:{type: DataTypes.STRING,allowNull: true},
},
{
    sequelize,
    modelName: 'Tutor'
})