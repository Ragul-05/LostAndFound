import api from './api';

export const registerUser = async (data) => {
  const response = await api.post('/users/register', data);
  return response.data;
};

export const loginUser = async (data) => {
  const response = await api.post('/users/login', data);
  return response.data;
};

export const getAllUsers = async () => {
  const response = await api.get('/users/all');
  return response.data;
};

export const getUserById = async (id) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const updateUser = async (id, data) => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};
