import axios from 'axios';
import { Quote } from '../types';

const API_BASE = '/api';

axios.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const getQuote = async (symbol: string): Promise<Quote> => {
  const response = await axios.get(`${API_BASE}/quote/${symbol}`);
  return response.data;
};
