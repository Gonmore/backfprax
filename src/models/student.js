import { DataTypes } from "sequelize"
import sequelize from "../database/database.js"

export const Student = sequelize.define('students', {
    id:{
        type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true,
    },
    grade:{
        type: DataTypes.STRING,allowNull: true,
    },
    course:{
        type: DataTypes.STRING,allowNull: true,
    },
    car:{type: DataTypes.BOOLEAN, defaultValue:false},
    tag:{
        type: DataTypes.STRING,allowNull: true,
    },
    active:{type: DataTypes.BOOLEAN, defaultValue:true},
    description:{type: DataTypes.STRING, allowNull:true},
    photo:{type: DataTypes.STRING, allowNull: true}, // Foto del estudiante
    disp:{
        type: DataTypes.DATEONLY,allowNull: true,
    },
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
    profamilyId: {
        type: DataTypes.INTEGER,
        allowNull: true,
        references: {
            model: 'profamilys',
            key: 'id'
        }
    },
    tutorId: {
        type: DataTypes.STRING,
        allowNull: true,
        references: {
            model: 'tutors',
            key: 'id'
        }
    },
})

