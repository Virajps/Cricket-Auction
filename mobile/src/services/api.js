
import axios from 'axios';

const API_URL = 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const login = (username, password) => {
  return api.post('/auth/login', { username, password });
};

export const register = (username, password) => {
  return api.post('/auth/register', { username, password });
};

export default api;
