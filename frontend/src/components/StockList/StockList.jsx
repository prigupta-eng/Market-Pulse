// components/StockList/StockList.jsx
import React from "react";
import { FaTrash } from "react-icons/fa";
import "./StockList.scss"

export const StockList = ({ activeWatchlist, onBack, onTickerClick, onDeleteTicker }) => {
    const getRatingClass = (rating) => {
        if (!rating) return "neu";
        const lowerRating = rating.toLowerCase();
        if (lowerRating.includes("buy") || lowerRating.includes("bullish")) return "pos";
        if (lowerRating.includes("sell") || lowerRating.includes("bearish")) return "neg";
        return "neu"; 
    };

    return (
        <div className='stock-list-container'>
            <div className='stock-header'>
                <h3>{activeWatchlist ? activeWatchlist.name : "Market"}</h3>
                <button className='back-btn' onClick={onBack}>Back</button>
            </div>
            
            <div className='stock-items'>
                <div className='categories-header'>
                    <div>Symbol</div><div>Price</div><div>Rating</div> 
                </div>

                {activeWatchlist?.WatchListItems?.length > 0 ? (
                    activeWatchlist.WatchListItems.map((item) => {
                        const stock = item.stockDetails;
                        if (!stock) return null;

                        return (
                            <div key={item.ticker} className='stock-card' onClick={() => onTickerClick(item.ticker)}>
                                <div className='stock-symbol'>{item.ticker}</div>
                                <div className='stock-price'>
                                    {stock.last_price ? Number(stock.last_price).toFixed(2) : "N/A"}
                                </div>
                                <div className={`stock-change ${getRatingClass(stock.rating)}`}>
                                    {stock.rating || "-"}
                                </div>
                                <div className='stock-name'>{stock.name}</div>
                                <button 
                                    className="ticker-delete-btn"
                                    onClick={(e) => {
                                        e.stopPropagation();
                                        onDeleteTicker(activeWatchlist.id, item.ticker);
                                    }}
                                >
                                    <FaTrash size={12} />
                                </button>
                            </div>
                        );
                    })
                ) : (
                    <div style={{ padding: '20px', textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>
                        No stocks added to this list yet.
                    </div>
                )}
            </div>
        </div>
    );
};