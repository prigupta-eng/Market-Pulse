import express from 'express'
import { config } from 'dotenv'
import cors from 'cors'
import cookieParser from 'cookie-parser'
// 1. Import sequelize along with connect_db
import { connect_db, sequelize } from './config/db.js' 
import userRouter from './routes/userRoutes.js'
import stockRouter from './routes/stockRoutes.js'

// --- 2. IMPORT YOUR MODELS HERE ---
// This registers them with Sequelize so it knows what tables to build.
import './models/watchListModel.js'; 
import './models/watchListItems.js'; 
import './models/stocksModel.js'
import './models/stockPriceModel.js'


config()

const app = express()

const PORT = process.env.PORT || 5000

app.use(cors({ origin: 'http://localhost:3000', credentials: true }))
app.use(cookieParser())
app.use(express.json())

app.use('/api/users', userRouter);
app.use('/api/stocks', stockRouter);

app.get('/', (req, res) => {
    res.send('API is running...');
});

const startServer = async () => {
    // Connect to DB
    await connect_db()

    // --- 3. ADD THIS BLOCK TO CREATE TABLES ---
    try {
        // 'alter: true' checks your models and updates the DB tables to match them.
        await sequelize.sync({ alter: true });
        console.log("✅ Database tables synced successfully!");
    } catch (error) {
        console.error("❌ Error syncing database tables:", error);
    }

    app.listen(PORT, () => {
        console.log(`Server running on port ${PORT}`)
    })
}

startServer()