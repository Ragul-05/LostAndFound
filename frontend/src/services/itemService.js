import api from './api';

export const getAllItems = async () => {
  const response = await api.get('/items/all');
  return response.data;
};

export const getItemStats = async () => {
  const response = await api.get('/items/stats');
  return response.data;
};

// Authenticated user reports item (no username param — taken from JWT)
export const reportLostItem = async (data) => {
  const response = await api.post('/items/report-lost', data);
  return response.data;
};

export const getUserItems = async (username) => {
  const response = await api.get(`/items/user/${encodeURIComponent(username)}`);
  return response.data;
};

// Admin-only actions — no username param, JWT carries identity
export const reportFoundItem = async (itemId) => {
  const response = await api.post(`/items/${itemId}/report-found`);
  return response.data;
};

export const claimItem = async (itemId) => {
  const response = await api.post(`/items/${itemId}/claim`);
  return response.data;
};

export const dispatchItem = async (itemId) => {
  const response = await api.post(`/items/${itemId}/dispatch`);
  return response.data;
};
