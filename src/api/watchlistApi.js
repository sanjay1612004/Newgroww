import api from './axios';

export const addToWatchlist = (searchId) => api.post('/watchlist/add', { searchId });
export const getWatchlist = () => api.get('/watchlist/');
export const removeFromWatchlist = (symbol) => api.delete(`/watchlist/${symbol}`);
