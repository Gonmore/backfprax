import { DataTypes } from "sequelize"
import sequelize from "../database/database.js"

export const Scenter = sequelize.define('scenters', {
    id:{
        type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true,
    },
    name:{
        type: DataTypes.STRING,allowNull: false,
        validate:{notNull:{ msg:'Name must not be null'}},
    },
    code:{
        type: DataTypes.STRING,allowNull: true
    },
    city:{type: DataTypes.STRING, allowNull: true},
    active:{type: DataTypes.BOOLEAN, defaultValue:true},
    address:{
        type: DataTypes.STRING, allowNull: true
    },
    phone:{
        type: DataTypes.STRING, allowNull: true
    },
    email:{type: DataTypes.STRING,allowNull: true},
    codigo_postal:{type: DataTypes.STRING,allowNull: true},       
})

