import { Router } from "express";
import { getMultipleStocks, createWatchList, getAllWatchlists, deleteTickerFromList, deleteWatchList,getStockPriceHistory, EditWatchListName,getAllStockPresent } from "../controller/stocksController.js";
import { isAuth } from "../middleware/auth.js";
const stockRouter = Router();

stockRouter.get('/search', getMultipleStocks)
stockRouter.get('/all', getAllStockPresent)
stockRouter.get('/watchlist/my',isAuth, getAllWatchlists)
stockRouter.post('/watchlist/', isAuth, createWatchList)

stockRouter.patch('/watchlist/:watchlistId/name', isAuth, EditWatchListName)
stockRouter.delete('/watchlist/:watchlistId',isAuth, deleteWatchList)
stockRouter.delete('/watchlist/:watchlistId/ticker/:ticker', isAuth, deleteTickerFromList)
stockRouter.get('/watchlist/:ticker', getStockPriceHistory)



export default stockRouter;