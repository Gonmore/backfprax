import { DataTypes } from "sequelize"
import sequelize from "../database/database.js"
import { Status, Goal } from "../constants/index.js"


export const Offer =  sequelize.define('offers', {
    id:{
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
    },
    name:{type: DataTypes.STRING,allowNull: false},
    location:{type: DataTypes.STRING,allowNull: false},
    mode:{type: DataTypes.STRING,allowNull: false},
    type:{type: DataTypes.STRING,allowNull: false},
    period:{type: DataTypes.STRING,allowNull: false},
    schedule:{type: DataTypes.STRING,allowNull: false},
    min_hr: {type: DataTypes.INTEGER, defaultValue: 200},
    car:{type: DataTypes.BOOLEAN,defaultValue: false},
    sector:{type: DataTypes.STRING,allowNull: true},
    tag:{type: DataTypes.STRING,allowNull: false},
    description:{type: DataTypes.STRING,allowNull: false},
    jobs:{type: DataTypes.STRING,allowNull: false},
    requisites:{type: DataTypes.STRING,allowNull: false},
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
        allowNull: false
    },
    companyId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'companies',
            key: 'id'
        }
    },
});

