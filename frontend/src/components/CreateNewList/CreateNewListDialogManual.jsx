import { useEffect, useState } from "react"
import React from 'react'
import { useNavigate } from "react-router-dom";
import './CreateNewListDialogManual.scss'
import { FaTimes } from "react-icons/fa";
import { createNewWatchList } from "../../api/auth";
import CreateNewListCsv from "./CreateNewListCsv";

const CreateNewListDialogManual = ({isOpen, onClose, onSuccess}) => {
    const navigate = useNavigate();

    const [modalStep, setModalStep] = useState(1);
    const [creationMethod, setCreationMethod] = useState('manual');

    //search states
    const [listName, setListName] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [selectedStocks, setSelectedStocks] = useState([]);
    const [isLoading, setIsLoading] = useState(false);


    //messages
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const handleClose = () =>{
        setModalStep(1);
        setCreationMethod('manual');
        setSearchQuery('');
        setSearchResults([]);
        setSelectedStocks([]);
        setErrorMessage('');
        setSuccessMessage('');
        setListName('');
        // navigate('/dashboard/watchlists');
        onClose();
    }
    
    const handleCreationMethod = () =>{
        if(creationMethod === 'manual'){
            setModalStep(2);
        }
        else{
            setModalStep(3);
        }
    }

    const handleFinish = async() =>{
        setErrorMessage('');
        setSuccessMessage('');

        if (!listName.trim()) {
            setErrorMessage("Listname is required");
            return;
        }
        const payload= {
            name: listName,
            stocks : selectedStocks,
        }
        try{
            const {data} = await createNewWatchList(payload);
            setSuccessMessage(data.message || "List created successfully!");
            // alert(`Welcome ${data.name || data.email || 'User'}`)
            onSuccess(); // Call the onSuccess callback to refresh watchlists in parent component

            setTimeout(() => {
                handleClose();
                // You might also want to trigger a re-fetch of the watchlists in the parent component here!
                navigate('/dashboard/watchlists');
            }, 200);
        }catch(error){
            console.error("error agya",error);
            if (error.response && error.response.data && error.response.data.error) {
                setErrorMessage(error.response.data.error);
            } else {
                setErrorMessage("An unexpected error occurred. Please try again.");
            }
        }

    }
    // Debounce logic for search input
    useEffect(() => {
        if(!searchQuery.trim()){
            setSearchResults([]);
            return;
        }
        const delayDebouncefn = setTimeout(async () =>{
            setIsLoading(true)
            try{
                const response = await fetch(`http://localhost:5000/api/stocks/search?q=${searchQuery}`);
                const data     = await response.json();
                setSearchResults(data)
            }
            catch(err){
                console.error("error fetching stocks : ", err)
            }
            finally{
                setIsLoading(false);
            }
        },500)
        return ()=> clearTimeout(delayDebouncefn)

        
    },[searchQuery])


    const addStock = (stock) =>{
        if(!selectedStocks.find(s => s.ticker === stock.ticker)){
            setSelectedStocks([...selectedStocks, stock])
        }
        setSearchQuery('');
        setSearchResults([]);
    }
    

    const removeStock = (tickerToRemove) =>{
        setSelectedStocks(selectedStocks.filter(stock =>stock.ticker !== tickerToRemove))
    }
    if(!isOpen){
        return null;
    }

    return(
        <div className="modal-overlay">
            <div className="modal-box">
                <div className="modal-header">
                    <h3>Create a new list</h3>
                    <button className="close-btn" onClick={handleClose}><FaTimes/></button>
                </div>


                {/* select method */}
                {modalStep === 1 && (
                    <div className="modal-body step-1">
                        <h2>How would you like to create the new list?</h2>

                        <div 
                            className={`selection-card ${creationMethod === 'csv' ? 'selected' : ''}`}
                            onClick={() => setCreationMethod('csv')}
                        >
                            <div className={`radio-circle ${creationMethod === 'csv' ? 'selected' : ''}`}></div> 
                            <span>Import List from CSV</span>
                        </div>

                        <div 
                            className={`selection-card ${creationMethod === 'manual' ? 'selected' : ''}`}
                            onClick={() => setCreationMethod('manual')}
                        >
                            <div className={`radio-circle ${creationMethod === 'manual' ? 'selected' : ''}`}></div> 
                            <span>Create List Manually</span>
                        </div>

                        <div className="modal-footer">
                            <button className="btn-next" onClick={handleCreationMethod}>Next</button>
                        </div>
                    </div>
                )}

                {/* modal step 2 */}
                {modalStep === 2 && (
                    <div className="modal-body step-2">

                        {errorMessage && <div className="alert-error" style={{ color: 'red', marginBottom: '10px', fontWeight: 'bold' }}>{errorMessage}</div>}
                        {successMessage && <div className="alert-success" style={{ color: 'green', marginBottom: '10px', fontWeight: 'bold' }}>{successMessage}</div>}

                        <div className="input-group">
                            <label>Name your list:</label>
                            <input type="text" placeholder="Enter list name..." autoFocus value={listName}
                             onChange={(e) => {
                                setListName(e.target.value);
                                setErrorMessage("");
                                }} />
                        </div>
                        
                        <div className="selected-stocks-area">
                            {selectedStocks.map((stock) =>(
                                <div key = {stock.ticker} className="stock-chip">
                                    <span>{stock.ticker}</span>
                                    <FaTimes className="remove-icon"
                                    onClick={() => removeStock(stock.ticker)}/>
                                </div>
                            ))}
                        </div>

                        <div className="input-group search-contaier">
                            <label>Search or type symbols to add to the list:</label>
                            <input type="text"
                            placeholder="Type to search (e.g. AAPLE, TESLA)"
                            value={searchQuery}
                            onChange={(e) =>setSearchQuery(e.target.value)}
                            className="search-input"/>
                            

                            {/* dropdownn results */}
                            {searchQuery && (
                                <div className="search-results-dropdown">
                                    {isLoading ?(
                                        <div className="search-item-loading">Loading......</div>
                                    ):(
                                        <>
                                            {searchResults.length > 0 ? (
                                                searchResults.map((stock) => (
                                                    <div key={stock.ticker} className="search-item" onClick={() => addStock(stock)}>
                                                        <div className="stock-info">
                                                            <span className="ticker">{stock.ticker}</span>
                                                            <span className="name">{stock.name}</span>
                                                        </div>
                                                        <div className="stock-price">
                                                            ${stock.last_price ? Number(stock.last_price).toFixed(2) : 'N/A'}
                                                        </div>
                                                    </div>
                                                ))
                                            ) : (
                                                <div className="search-item-no-results">No results found</div>
                                            )}
                                        
                                        </>
                                    )}
                                </div>
                            )}
                        </div>

                        <p className="note">Tickers not identified in the database will not be added.</p>

                        <div className="modal-footer space-between">
                            <button className="btn-prev" onClick={() => {
                                setModalStep(1);
                                setErrorMessage('');
                            }}>Previous</button>
                            <button className="btn-finish" onClick={() => {
                                handleFinish();
                            }}>Finish</button>
                        </div>
                    </div>
                )}
                {modalStep === 3 && (
                    <CreateNewListCsv 
                        onBack={ () => {
                            setModalStep(1);
                            setErrorMessage('')
                        }}
                        onSuccess={onSuccess}
                        onClose={ () =>{
                            handleClose();
                            navigate('/dashboard/watchlists');
                        }}                       
                    />
                )}
            </div>

        </div>
    )
}

export default CreateNewListDialogManual;