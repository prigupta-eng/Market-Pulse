// components/CreateNewList/CsvUploadStep.jsx
import React, { useState } from 'react';
import { createNewWatchList } from "../../api/auth"; // Adjust path if needed
import './CreateNewListCsv.scss'
import {ToastContainer, toast} from 'react-toastify'

const CreateNewListCsv = ({ onBack, onSuccess, onClose }) => {
    const [listName, setListName] = useState('');
    const [file, setFile] = useState(null);
    const [parsedStocks, setParsedStocks] = useState([]);
    
    const [errorMessage, setErrorMessage] = useState('');
    const [successMessage, setSuccessMessage] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    // 1. Handle File Selection & Parsing
    const handleFileUpload = (e) => {
        setErrorMessage('');
        const selectedFile = e.target.files[0];
        
        if (!selectedFile) return;
        if (!selectedFile.name.endsWith('.csv')) {
            setErrorMessage("Please upload a valid .csv file");
            return;
        }

        setFile(selectedFile);

        // Read the CSV file
        const reader = new FileReader();
        reader.onload = (event) => {
            const text = event.target.result;
            
            // Split by commas or newlines, remove spaces/quotes, and filter out empties
            const tickers = text
                .split(/[\r\n,]+/)
                .map(t => t.trim().replace(/['"]/g, ''))
                .filter(t => t.length > 0);

            // Ignore a header row if it exists (e.g., "Ticker", "Symbol")
            if (tickers.length > 0 && (tickers[0].toLowerCase() === 'ticker' || tickers[0].toLowerCase() === 'symbol')) {
                tickers.shift(); 
            }

            // Deduplicate immediately
            const uniqueTickers = [...new Set(tickers)];
            setParsedStocks(uniqueTickers);
        };
        reader.readAsText(selectedFile);
    };

    // 2. Handle Submission
    const handleFinish = async () => {
        setErrorMessage('');
        setSuccessMessage('');

        if (!listName.trim()) {
            setErrorMessage("List name is required.");
            return;
        }
        if (parsedStocks.length === 0) {
            setErrorMessage("No valid tickers found in the CSV.");
            return;
        }

        setIsLoading(true);

        try {
            // Your API is already perfectly set up to accept an array of strings!
            const payload = {
                name: listName,
                stocks: parsedStocks, 
            };
            
            const { data } = await createNewWatchList(payload);
            setSuccessMessage(data.message || "List imported successfully!");
            toast.success(data.message || "List imported successfully!");
            onSuccess(); // Refresh parent lists

            setTimeout(() => {
                
                onClose(); // Close the modal
            }, 1000);

        } catch (error) {
            console.error("CSV Upload Error:", error);
            if (error.response?.data?.error) {
                toast.error(error)
                setErrorMessage(error.response.data.error);
            } else {
                setErrorMessage("An unexpected error occurred. Please try again.");
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="modal-body step-csv">
            {errorMessage && <div className="alert-error">{errorMessage}</div>}
            {successMessage && <div className="alert-success">{successMessage}</div>}

            {/* List Name Input */}
            <div className="input-group">
                <label>Name your list:</label>
                <input 
                    type="text" 
                    placeholder="Enter list name..." 
                    value={listName}
                    onChange={(e) => { setListName(e.target.value); setErrorMessage(""); }} 
                />
            </div>

            {/* File Picker */}
            <div className="input-group">
                <label>Upload CSV File:</label>
                {/* Changed this div to use our new SCSS class instead of inline styles */}
                <div className="upload-dropzone">
                    <input 
                        type="file" 
                        accept=".csv" 
                        onChange={handleFileUpload} 
                    />
                    {file && (
                        <p className="upload-success-text">
                            ✓ File loaded! Found {parsedStocks.length} unique tickers.
                        </p>
                    )}
                </div>
                <p className="note">CSV should contain a simple list of ticker symbols.</p>
            </div>

            {/* Footer Buttons */}
            <div className="modal-footer space-between" style={{ marginTop: 'auto', paddingTop: '20px' }}>
                <button className="btn-prev" onClick={onBack} disabled={isLoading}>Previous</button>
                <button className="btn-finish" onClick={handleFinish} disabled={isLoading}>
                    {isLoading ? "Importing..." : "Finish"}
                </button>
            </div>
        </div>
    );
};

export default CreateNewListCsv;