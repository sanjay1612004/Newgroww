import api from './axios';

export const getMostBought = () => api.get('/market/most-bought');
export const getTopGainers = () => api.get('/market/top-gainers');
export const getTopLosers = () => api.get('/market/top-losers');
export const getTrendingSectors = () => api.get('/market/trending-sectors');
export const getNews = () => api.get('/market/news');
export const getStockDetails = (searchId) => api.get(`/market/stock/${searchId}`);
export const searchStocks = (q) => api.get(`/market/search?q=${encodeURIComponent(q)}`);
export const getChart = (symbol, range = '1M', type = 'candle') =>
  api.get(`/market/chart/${symbol}`, { params: { range, type } });
