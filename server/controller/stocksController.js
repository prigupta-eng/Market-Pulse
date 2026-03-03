import { sequelize } from "../config/db.js";
import { Op } from "sequelize";
import { QueryTypes, where } from "sequelize";
import WatchListItem from "../models/watchListItems.js";
import Watchlist from "../models/watchListModel.js";
import stockDataModel from "../models/stocksModel.js";
import stockPriceModel from "../models/stockPriceModel.js";
import jwt from 'jsonwebtoken'
import { config } from "dotenv"
config()


export const getMultipleStocks = async (req, res) => {
    try {
        const userInput = req.query.q;

        if (!userInput) {
            return res.status(400).json({ error: "Search query is required" });
        }

        const query = `
            SELECT ticker, name, rating, last_price
            FROM stocks_data
            WHERE ticker ILIKE :search OR name ILIKE :search
            ORDER BY ticker ASC
            LIMIT 10;
        `;

        const result = await sequelize.query(query, {
            replacements: { search: `${userInput}%` },
            type: QueryTypes.SELECT
        });

        res.json(result);

    } catch (err) {
        console.error(err);
        return res.status(500).json({ error: `Internal server error` });
    }
};

export const getAllWatchlists = async(req, res) =>{
    try{
        const token = req.cookies.token;

        if(!token){
            return res.status(401).json({error : "Not authenticated"})
        }
        const decoded = jwt.verify(token, process.env.JWT_SECRET)
        const userId  = decoded.id;
        const watchlists = await Watchlist.findAll({
            where: { user_id: userId },
            attributes: ['id', 'name'], // Get list ID and Name
            include: [
                {
                    model: WatchListItem,
                    attributes: ['id', 'ticker'], // Also get the tickers inside this list
                    include : [
                        {
                            model : stockDataModel,
                            as : 'stockDetails',
                            attributes : ['ticker','name', 'last_price', 'rating']
                        }

                    ]
                }
            ],
            order: [['id', 'ASC']]   // Sort by oldest list first
        });

        res.json(watchlists);

    }
    catch(error){
        res.status(500).json({error : `Internal server error ${error}`})
    }
}

export const createWatchList = async (req, res) => {
    try {
        const { name, stocks } = req.body;
        const userId = req.user.id;

        // 1. Basic Validation
        if (!name) {
            return res.status(400).json({ error: "List name is required" });
        }

        // 2. Check for duplicate watchlist name for this user
        const existingList = await Watchlist.findOne({ 
            where: { user_id: userId, name: name } 
        });
        
        if (existingList) {
            return res.status(400).json({ 
                error: `You already have a list named '${name}'. Please choose a different name.` 
            });
        }

        // 3. Normalize the incoming stocks array (Handles BOTH Manual and CSV)
        let uniqueTickers = [];
        if (stocks && Array.isArray(stocks) && stocks.length > 0) {
            const extractedTickers = stocks.map(stock => {
                // If Manual Method (Object): extract the ticker property
                if (typeof stock === 'object' && stock !== null && stock.ticker) {
                    return stock.ticker.toUpperCase();
                }
                // If CSV Method (String): just use the string
                if (typeof stock === 'string') {
                    return stock.toUpperCase();
                }
                return null;
            }).filter(Boolean); // .filter(Boolean) strips out any nulls/undefined

            // Remove duplicates just in case the CSV had them
            uniqueTickers = [...new Set(extractedTickers)];
        }

        // 4. Verify tickers exist in the DB
        // (Crucial for CSV, but also a good safety net for manual UI bugs)
        let validTickers = [];
        if (uniqueTickers.length > 0) {
            const validStocksFromDb = await stockDataModel.findAll({
                where: {
                    ticker: { [Op.in]: uniqueTickers }
                },
                attributes: ['ticker']
            });
            validTickers = validStocksFromDb.map(stock => stock.ticker);
        }

        // 5. Create the parent Watchlist
        const newList = await Watchlist.create({
            user_id: userId,
            name: name,
        });

        // 6. Bulk create the items linking to the list
        if (validTickers.length > 0) {
            const listItems = validTickers.map(ticker => ({
                watchlist_id: newList.id,
                ticker: ticker
            }));
            await WatchListItem.bulkCreate(listItems);
        }

        // 7. Success! Return the data
        return res.status(201).json({
            message: "List created successfully", 
            list: newList,
            addedStocks: validTickers
        });

    } catch (error) {
        console.error("Error creating watchlist:", error);
        return res.status(500).json({ error: "Internal server error" });
    }
};


export const deleteTickerFromList = async (req, res) => {
    try{
        const { watchlistId, ticker } = req.params;
        await WatchListItem.destroy({
            where : {
                watchlist_id : watchlistId,
                ticker : ticker
            }
        }); 
        return res.json({ message: "Stock removed from watchlist" });
    }
    catch(error){
        console.error(`Error deleting ticker ${ticker} from list ${watchlistId}:`, error);
        return res.status(500).json({ error: `Internal server error` });    
    }
}


export const deleteWatchList = async (req, res) =>{
    try{
        const {watchlistId} = req.params;
       
        const token = req.cookies.token;
        if (!token) {
            return res.status(401).json({ error: "Not authenticated" });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const userId = decoded.id;

        const watchlist = await Watchlist.findOne({
            where: { id: watchlistId, user_id: userId }
        });

        if (!watchlist) {
            return res.status(404).json({ error: "Watchlist not found or inaccessible" });
        }

        // await WatchListItem.destroy({
        //     where: { watchlist_id: watchlistId }
        // });

        await Watchlist.destroy({
            where: { id: watchlistId, user_id: userId }
        });

        return res.json({ message: "Watchlist deleted successfully" });
    }
    catch(error){  
        return res.status(500).json({error : `Internal server error ${error}`})
    }
}


export const getStockPriceHistory = async(req,res) =>{
    try{
        const {ticker} = req.params;
        const stock = await stockDataModel.findOne({ where : { ticker }})
        if(!stock){
            return res.status(500).json({error : `Stock ticker not found `})
        }
        const history = await stockPriceModel.findAll({where : { ticker },
                    attributes : ['timestamp','open_price','close_price','low_price','high_price', 'volume'],
                    order: [['timestamp', 'ASC']]
                    })
        
        return res.status(200).json({
            symbol : stock.ticker,
            name : stock.name,
            last_price : stock.last_price,
            history: history
        })
    }
    catch(error){
        res.status(500).json({error : `Internal server error ${error}`})
    }
}



export const EditWatchListName = async (req, res) => {
    try {
        const { watchlistId } = req.params;
        const { newName } = req.body;
        const userId = req.user.id;

        if (!newName) {
            return res.status(400).json({ error: "New name is required" });
        }

        const watchlist = await Watchlist.findOne({
            where: { id: watchlistId, user_id: userId }
        });

        if (!watchlist) {
            return res.status(404).json({ error: "Watchlist not found or inaccessible" });
        }

        const existingList = await Watchlist.findOne({
            where: { user_id: userId, name: newName }
        });

        if (existingList && existingList.id !== watchlist.id) {
            return res.status(400).json({
                error: `You already have a list named ${newName}. Please choose a different name.`
            });
        }

        watchlist.name = newName;
        await watchlist.save();

        return res.json({ message: "Watchlist name updated successfully" });

    } catch (error) {
        console.error(error);
        return res.status(500).json({ error: "Internal server error" });
    }
};

export const getAllStockPresent = async(req, res) =>{
    try{
        const data = await stockDataModel.findAll()
        return res.status(200).json({message : "success",data : data})
    }
    catch(err){
        console.error(err);
        return res.status(500).json({error: `Internal server error ${err}`})

    }
}


