import axios from 'axios'

const apiUrl = 'http://localhost:5000/api/'


const apiClient = axios.create({
    baseURL : apiUrl,
    withCredentials:true,
    headers : {
        'Content-Type' : 'application/json'
    },
});


export const loginUser = async (credentials) =>{
    return apiClient.post('users/login', credentials)
}

export const signupUser = async(credentials) =>{
    return apiClient.post('users/signup', credentials)
}
export const getCurrentUser = async () => {
    return apiClient.get('users/me');
};


export const createNewWatchList = async(payload) =>{
    return apiClient.post('stocks/watchlist/', payload)
}

export const getAllWatchList = async(credentials) =>{
    return apiClient.get('stocks/watchlist/my', credentials)
}

export const deleteWatchList = async (watchlistId) =>{
    return apiClient.delete(`stocks/watchlist/${watchlistId}`)
}
export const deleteTickerFromWatchlist = async(watchlistId, ticker) =>{
    return apiClient.delete(`stocks/watchlist/${watchlistId}/ticker/${ticker}`)
}
export const getStockHistory = async(ticker) =>{
    return apiClient.get(`stocks/watchlist/${ticker}`)
}

export const renameWatchlist = async(watchlistId, newName) =>{
    return apiClient.patch(`stocks/watchlist/${watchlistId}/name`,{newName})
}

export const getAllStocksPresent = async() =>{
    return apiClient.get(`stocks/all`)
}