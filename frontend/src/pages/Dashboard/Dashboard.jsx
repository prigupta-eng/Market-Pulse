import React, { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router";
import { getAllWatchList, getCurrentUser, deleteWatchList, deleteTickerFromWatchlist, getAllStocksPresent } from "../../api/auth";
import { FaPlus, FaTimes, FaEdit, FaTrash } from "react-icons/fa";

// Components
import Breadcrumbs from "../../components/Breadcrumbs/Breadcrumbs.jsx";
import CreateNewListDialogManual from "../../components/CreateNewList/CreateNewListDialogManual.jsx";
import { EditWatchList } from "../../components/EditWatchlist/EditWatchList.jsx";
import { ChartSection } from "../../components/ChartSection/ChartSection.jsx"; // Note: adjust path
import { StockList } from "../../components/StockList/StockList.jsx"; // Note: adjust path
import { SidebarData } from "./SidebarData.js";
import "./Dashboard.scss";
import { load } from "@amcharts/amcharts5/.internal/core/util/Net.js";


const Dashboard = () => {
    // --- State Management ---
    const [user, setUser] = useState(null);
    const [userWatchlist, setUserWatchlist] = useState([]);
    const [isSidebarOpen, setIsSidebarOpen] = useState(true);
    const [isSubSidebarOpen, setIsSubSidebarOpen] = useState(false);
    const [subItems, setSubItems] = useState([]);
    
    // Modals & Navigation
    const [showModal, setShowModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [activeMainPath, setActiveMainPath] = useState("");
    const [currentView, setCurrentView] = useState("menu"); 
    const [activeListId, setActiveListId] = useState(null);
    const [selectedTicker, setSelectedTicker] = useState(null);

    const navigate = useNavigate();
    const location = useLocation();

    const [stocks, setStocks] = useState([]);
    // --- Data Fetching ---
    const fetchUserWatchlist = async () => {
        try {
            const { data } = await getAllWatchList();
            setUserWatchlist(data);
        } catch (err) {
            console.error(`Error retrieving user's Watchlist ${err}`);
        }
    };

    useEffect(() => {
        const fetchUser = async () => {
            try {
                const { data } = await getCurrentUser();
                setUser(data);
            } catch (err) {
                navigate("/");
            }
        };
        fetchUser();
    }, [navigate]);


    useEffect(() =>{
        const loadData = async() =>{
            const stockData = sessionStorage.getItem("allStockData")

            if(stockData){
                setStocks(JSON.parse(stockData))
                return;                
            }
            try {
                const response = await getAllStocksPresent();
                
                // Access the 'data' property inside the response object
                const fetchedData = response.data.data; 

                if (Array.isArray(fetchedData)) {
                    setStocks(fetchedData);
                    sessionStorage.setItem("allStockData", JSON.stringify(fetchedData));
                }
            } catch (error) {
                console.error("Error loading stocks:", error);
            }
        }
        loadData();
    },[])
    // --- URL Syncing ---
    useEffect(() => {
        if (!user) return;
        const pathSegments = location.pathname.split("/").filter(Boolean);
        const currentPath = pathSegments[1] || "";
        const listIdFromUrl = pathSegments[2];

        setActiveMainPath(currentPath);
        if (currentPath === "watchlists") fetchUserWatchlist();

        const activeItem = SidebarData.find(item => item.path === currentPath);
        if (activeItem?.subItems) {
            setSubItems(activeItem.subItems);
            setIsSubSidebarOpen(true);
        } else {
            setIsSubSidebarOpen(false);
        }

        if (currentPath === 'watchlists' && listIdFromUrl) {
            setActiveListId(Number(listIdFromUrl));
            setCurrentView("stocks");
        } else {
            setActiveListId(null);
            setCurrentView("menu");
        }
    }, [location.pathname, user]);

    // --- Handlers ---
    const mainItemClickHandler = (item) => {
        setCurrentView("menu");
        setActiveListId(null);
        navigate(`/dashboard/${item.path}`);
    };

    const handleDeleteWatchlist = async (watchlistId) => {
        if (window.confirm("Are you sure you want to delete this watchlist?")) {
            try {
                await deleteWatchList(watchlistId);
                fetchUserWatchlist();
            } catch (error) {
                alert("Failed to delete watchlist.");
            }
        }
    };

    const handleDeleteTickerFromWatchlist = async (watchlistId, ticker) => {
        if (window.confirm("Delete this ticker from the watchlist?")) {
            try {
                await deleteTickerFromWatchlist(watchlistId, ticker);
                fetchUserWatchlist();
            } catch (error) {
                alert("Failed to delete ticker.");
            }
        }
    };

    if (!user) return <h2>Loading...</h2>;

    const activeWatchlist = userWatchlist.find(list => list.id === activeListId);

    // --- Render ---
    return (
        <div className="layout">
            {/* Primary Sidebar */}
            <div className={`sidebar ${isSidebarOpen ? "open" : "closed"}`}>
                <div className="sidebar-header">
                    <button className="toggle-btn" onClick={() => setIsSidebarOpen(!isSidebarOpen)}>
                        <div className={`arrow ${isSidebarOpen ? "left" : "right"}`}></div>
                    </button>
                </div>
                <ul className="menu">
                    {SidebarData.map((item, index) => (
                        <li key={index} onClick={() => mainItemClickHandler(item)}>
                            {item.icon} <span>{item.title}</span>
                        </li>
                    ))}
                </ul>
            </div>

            {/* Sub-Sidebar */}
            <div className={`sub-sidebar ${isSubSidebarOpen ? "open" : "closed"}`}>
                <button className="close-btn" onClick={() => { setIsSubSidebarOpen(false); navigate("/dashboard"); }}>
                     <FaTimes />
                </button>
                
                <div className='breadcrumbs-container'>
                    <Breadcrumbs activeWatchlist={currentView === "stocks" ? activeWatchlist : null} />
                </div>
                <div className='divider'></div>

                {/* Sub-Sidebar Content Routing */}
                {currentView === "menu" ? (
                    <div className='sub-sidebar-content'>
                        {activeMainPath === "watchlists" ? (
                            <>
                                <div className="create-list-btn" onClick={() => setShowModal(true)}>
                                    <FaPlus className="plus-icon" /> <span>Create a new list</span>
                                </div>
                                <h4 style={{ margin: '15px 0 5px 0', fontSize: '0.9rem', color: '#888' }}>My Lists</h4>
                                <ul>
                                    {userWatchlist?.length > 0 ? userWatchlist.map((list) => (
                                        <li key={list.id} className="watchlist-item" onClick={() => navigate(`/dashboard/watchlists/${list.id}`)}>
                                            <span className="watchlist-name">{list.name}</span>
                                            <div className="watchlist-actions">
                                                <button className="edit-btn" onClick={(e) => { e.stopPropagation(); setActiveListId(list.id); setShowEditModal(true); }}>
                                                    <FaEdit />
                                                </button>
                                                <button className="delete-btn" onClick={(e) => { e.stopPropagation(); handleDeleteWatchlist(list.id); }}>
                                                    <FaTrash />
                                                </button>
                                            </div>
                                        </li>
                                    )) : <li style={{ color: '#555' }}>No lists created yet.</li>}
                                </ul>
                            </>
                        ) : (
                            <ul>
                                {subItems.map((item, index) => (
                                    <li key={index} onClick={() => navigate(`/dashboard/${location.pathname.split('/')[1]}/${item.toLowerCase()}`)}>
                                        <span>{item}</span>
                                    </li>
                                ))}
                            </ul>
                        )}
                    </div>
                ) : (
                    <StockList 
                        activeWatchlist={activeWatchlist} 
                        onBack={() => navigate("/dashboard/watchlists")} 
                        onTickerClick={setSelectedTicker}
                        onDeleteTicker={handleDeleteTickerFromWatchlist}
                    />
                )}
            </div>

            {/* Main Content Area */}
            <div className="content">
                <div className="create-list-btn" onClick={() => setShowModal(true)}>
                                    <FaPlus className="plus-icon" /> <span>Create a new list</span>
                                </div>
                {selectedTicker ? (
                    <ChartSection 
                        ticker={selectedTicker} 
                        onClose={() => setSelectedTicker(null)} 
                    />
                ) : (
                    <>
                        <div className="stocks-container">
                            <div className="stocks-header">
                                <div>Symbol</div>
                                <div>Price</div>
                                <div>Rating</div>
                            </div>

                            <div className="stocks-list">
                                {stocks?.map((item) => (
                                <div className="stock-card" key={item.ticker} onClick={()=>setSelectedTicker(item.ticker)}>
                                    {/* Row 1 */}
                                    <div className="stock-symbol">{item.ticker}</div>
                                    <div className="stock-price">
                                    {item.last_price}
                                    </div>
                                    <div
                                    className={`stock-rating ${
                                        item.rating === "Very Bullish"
                                        ? "bullish"
                                        : item.rating === "Bearish"
                                        ? "bearish"
                                        : "neutral"
                                    }`}
                                    >
                                    {item.rating || "Neutral"}
                                    </div>

                                    {/* Row 2 */}
                                    <div className="row-2">
                                        <div className="stock-name">{item.name}</div>
                                        <div className="instruction">Click to see Chart</div>
                                    </div>
                                    
                                
                                </div>
                                ))}
                            </div>
                            </div>
                        
                    </>
                )}
            </div>

            {/* Modals */}
            <CreateNewListDialogManual isOpen={showModal} onClose={() => setShowModal(false)} onSuccess={fetchUserWatchlist} />
            <EditWatchList isOpen={showEditModal} onClose={() => setShowEditModal(false)} onSuccess={fetchUserWatchlist} watchlistId={activeListId} />
        </div>
    );
};

export default Dashboard;