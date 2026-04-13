import axios from 'axios';
import { Quote } from '../types';

const API_BASE = '/api';

export const getQuote = async (symbol: string): Promise<Quote> => {
  const response = await axios.get(`${API_BASE}/quote/${symbol}`);
  return response.data;
};
