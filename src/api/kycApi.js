import api from './axios';

export const submitKyc = (data) => api.post('/kyc/submit', data);
export const getKycStatus = () => api.get('/kyc/status');

// Admin
export const getPendingKyc = () => api.get('/admin/kyc/pending');
export const getAllKyc = () => api.get('/admin/kyc/all');
export const getRejectedKyc = () => api.get('/admin/kyc/rejected');
export const approveKyc = (id) => api.patch(`/admin/kyc/${id}/approve`);
export const rejectKyc = (id) => api.patch(`/admin/kyc/${id}/reject`);

