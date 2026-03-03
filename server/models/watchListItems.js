import {DataTypes, Model} from 'sequelize'
import {sequelize} from '../config/db.js'
import Watchlist from './watchListModel.js';
import stockDataModel from './stocksModel.js';

const WatchListItem = sequelize.define('WatchListItem' , {
    id:{
        type : DataTypes.INTEGER,
        primaryKey : true,
        autoIncrement : true,
    },
    watchlist_id : {
        type:DataTypes.INTEGER,
        allowNull: false,
        references : {
            model : Watchlist,
            key : 'id'
        }
    },
    ticker:{
        type:DataTypes.STRING,
        allowNull:false
    },
},{
    tableName : "watchlist_items",
    timestamps : true,

    indexes: [
        {
            unique: true,
            fields: ['watchlist_id', 'ticker']
        }
    ]
})


//setup association
Watchlist.hasMany(WatchListItem, {
    foreignKey : "watchlist_id",
    onDelete   : "CASCADE",
    hooks : true});

WatchListItem.belongsTo(Watchlist, {
    foreignKey : "watchlist_id",
    onDelete: "CASCADE"})

WatchListItem.belongsTo(stockDataModel, { 
    foreignKey: 'ticker', 
    targetKey: 'ticker',
    as: 'stockDetails' // Alias to make frontend mapping easier
});


export default WatchListItem;