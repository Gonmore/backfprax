import { DataTypes } from "sequelize"
import sequelize from "../database/database.js"

export const OfferProfamily = sequelize.define('offer_profamilys', {
    id:{
        type: DataTypes.INTEGER,primaryKey: true,autoIncrement: true,
    },
    offerId: {
        type: DataTypes.INTEGER,
        allowNull: false,
        references: {
            model: 'offers',
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
    }
})