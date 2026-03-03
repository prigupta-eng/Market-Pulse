import { Sequelize } from "sequelize";
import {sequelize} from '../config/db.js' 
import { DataTypes } from 'sequelize'
import stockDataModel from "./stocksModel.js";

const stockPriceModel = sequelize.define('stockPrice',{
    id:{
        type:DataTypes.INTEGER,
        primaryKey:true,
        autoIncrement:true
    },
    ticker :{
        type:DataTypes.STRING(50),
        allowNull : false,
        references:{
            model:'stocks_data',
            key:'ticker'
        }
    },
    timestamp : {
        type: DataTypes.DATE,
        allowNull : false,
        defaultValue: DataTypes.NOW
    },
    open_price : {
        type: DataTypes.DECIMAL(15,2),
        allowNull : false 
    },
    close_price :{
        type : DataTypes.DECIMAL(15,2),
        allowNull:false,
    },
    high_price:{
        type :DataTypes.DECIMAL(15,2),
        allowNull : false
    },
    low_price:{
        type : DataTypes.DECIMAL(15,2),
        allowNull : false
    },
    volume:{
        type : DataTypes.BIGINT,
        allowNull : false
    }},
    {
        tableName: 'stock_price',
        timestamps: false
    });


stockDataModel.hasMany(stockPriceModel, { foreignKey: 'ticker' });
stockPriceModel.belongsTo(stockDataModel, { foreignKey: 'ticker' });


export default stockPriceModel;