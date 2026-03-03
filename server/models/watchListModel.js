import { DataTypes } from "sequelize";
import{ sequelize }from "../config/db.js";
import UserModel from "./userModel.js";


const Watchlist = sequelize.define(
    "Watchlist", {
        id: {
            type: DataTypes.INTEGER,
            primaryKey : true,
            autoIncrement :true,
        },
        user_id:{
            type: DataTypes.INTEGER,
            allowNull: false,
            references:{
                model : UserModel,
                key: 'id'
            }
        },
        name:{
            type:DataTypes.STRING,
            allowNull: false,
        },
    },{
        tableName :"watchlist",
        timestamps : true,

        
    });
    export default Watchlist;