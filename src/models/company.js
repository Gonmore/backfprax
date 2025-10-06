import { DataTypes } from "sequelize"
import sequelize from "../database/database.js"

export const Company = sequelize.define('companies', {
    id:{
        type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true,
    },
    name:{
        type: DataTypes.STRING,allowNull: false,
        validate:{notNull:{ msg:'Name must not be null'}},
    },
    code:{
        type: DataTypes.STRING,allowNull: false,
        validate:{notNull:{ msg:'Description must not be null' }}
    },
    city:{type: DataTypes.STRING, allowNull: true},
    active:{type: DataTypes.BOOLEAN, defaultValue:true},
    address:{
        type: DataTypes.STRING, allowNull: false,
        validate:{notNull:{msg:'Serie must not be null'}}
    },
    phone:{
        type: DataTypes.STRING, allowNull: false,
        validate:{
            notNull:{msg:'Phone must not be null'}}
    },
    email:{type: DataTypes.STRING,allowNull: true},
    web:{type: DataTypes.STRING,allowNull: true}, 
    rrhh:{type: DataTypes.STRING,allowNull: true}, 
    sector:{type: DataTypes.STRING,allowNull: true}, 
    main:{type: DataTypes.STRING,allowNull: true}, 
    description:{type: DataTypes.STRING,allowNull: true}, 
    userId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'users',
            key: 'id'
        }
    },
})

