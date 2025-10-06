import { DataTypes } from "sequelize"
import sequelize from "../database/database.js"
import { Status } from "../constants/index.js"
import { encriptar } from "../common/bcrypt.js"
import logger from '../logs/logger.js'



export const User = sequelize.define('users', {
    id:{type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true,
    },
    username:{
        type: DataTypes.STRING, allowNull: false,
        validate:{notNull:{ msg: 'Username must not be null'}},
    },
    email: { type: DataTypes.STRING,allowNull: true,unique: true,
    },
    password:{type: DataTypes.STRING,allowNull: true,
    },
    role: {
        type: DataTypes.STRING,
        allowNull: false,
        defaultValue: 'student',
        validate: {
            isIn: {
                args: [['student', 'company', 'scenter', 'tutor', 'admin']],
                msg: 'Role must be student, company, scenter, tutor, or admin'
            }
        }
    },
    name: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    surname: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    phone: {
        type: DataTypes.STRING,
        allowNull: true,
    },
    description: {
        type: DataTypes.TEXT,
        allowNull: true,
    },
    active: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    googleId: {type: DataTypes.STRING,unique: true,allowNull: true,
    },
    facebookId: {type: DataTypes.STRING, unique: true,allowNull: true,
    },
    image: {type: DataTypes.STRING,allowNull: true,
    },
    status: {
        type: DataTypes.STRING,
        defaultValue: Status.ACTIVE,
        validate: {
            isIn: {
                // ⚠️ ARREGLAR VALIDACIÓN - Era incorrecta
                args: [[Status.ACTIVE, Status.INACTIVE]], // ← CAMBIAR ESTO
                msg: 'Status must be active or inactive',
            },
        },
    },
    // 🌍 CAMPOS GEOGRÁFICOS
    countryCode: {
        type: DataTypes.STRING(2),
        allowNull: true,
        comment: 'Código ISO del país (ej: BO, AR, BR)'
    },
    
    cityId: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'ID de la ciudad de GeoNames'
    },
    address: {
        type: DataTypes.STRING,
        allowNull: true,
        comment: 'Dirección completa del usuario'
    }
}, {
    tableName: 'users',
    timestamps: true
})

// Hooks para encriptar contraseña
User.beforeCreate(async (user) => {
    if (user.password) {
        try {
            logger.info('Encrypting password for new user');
            user.password = await encriptar(user.password);
        } catch (error) {
            logger.error('Error encrypting password:', error.message);
            throw new Error('Error al crear contraseña');
        }
    }
});

User.beforeUpdate(async (user) => {
    if (user.changed('password') && user.password) { // ← SOLO SI LA CONTRASEÑA CAMBIÓ
        try {
            logger.info('Encrypting password for user update');
            user.password = await encriptar(user.password);
        } catch (error) {
            logger.error('Error encrypting password:', error.message);
            throw new Error('Error al actualizar contraseña');
        }
    }
});


