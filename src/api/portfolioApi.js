import api from './axios';

export const buyStock = (data) => api.post('/portfolio/buy', data);
export const sellStock = (data) => api.post('/portfolio/sell', data);
export const getHoldings = () => api.get('/portfolio/holdings');
export const getHistory = () => api.get('/portfolio/history');
export const getSummary = () => api.get('/portfolio/summary');
export const getAnalytics = () => api.get('/portfolio/analytics');
export const addMoney = (amount) => api.post('/portfolio/add-money', { amount });
