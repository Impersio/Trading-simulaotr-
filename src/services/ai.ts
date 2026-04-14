import axios from 'axios';
import { PortfolioState } from '../types';

const API_BASE = '/api';

export const getTradingSuggestions = async (portfolio: PortfolioState, currentSymbol: string, currentPrice: number) => {
  try {
    const response = await axios.post(`${API_BASE}/suggestions`, {
      portfolio,
      currentSymbol,
      currentPrice
    });
    return response.data.suggestion || "Keep an eye on the market trends and manage your risk carefully.";
  } catch (error) {
    console.error("Error getting AI suggestions:", error);
    return "AI suggestions are currently unavailable. Remember to diversify and manage your risk!";
  }
};
