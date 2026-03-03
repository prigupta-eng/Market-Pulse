import { useState, useEffect } from "react";
import "./EditWatchList.scss";
import { renameWatchlist } from "../../api/auth";

export const EditWatchList = ({ isOpen, onClose, watchlistId, onSuccess }) => {
    const [watchlistName, setWatchlistName] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        if (isOpen) {
            setWatchlistName("");
            setError("");
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleFinish = async () => {
        if (!watchlistName.trim()) {
            setError("Watchlist name cannot be empty");
            return;
        }

        try {
            setLoading(true);
            setError("");

            await renameWatchlist(watchlistId, watchlistName);

            onSuccess();   // refresh watchlists
            onClose();     // close modal
        } catch (err) {
            setError(`Failed to rename watchlist ${err}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="edit-watchlist-overlay">
            <div className="edit-watchlist-modal">
                <h3>Edit Watchlist Name</h3>

                <label>New Name</label>
                <input
                    className="name-input"
                    type="text"
                    value={watchlistName}
                    onChange={(e) => setWatchlistName(e.target.value)}
                    placeholder="Enter new name"
                />

                {error && <div className="error-msg">{error}</div>}

                <div className="modal-footer">
                    <button 
                        className="btn-cancel"
                        onClick={onClose}
                        disabled={loading}
                    >
                        Cancel
                    </button>

                    <button 
                        className="btn-finish"
                        onClick={handleFinish}
                        disabled={loading}
                    >
                        {loading ? "Saving..." : "Save"}
                    </button>
                </div>
            </div>
        </div>
    );
};