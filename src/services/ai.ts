import { GoogleGenAI } from '@google/genai';
import { PortfolioState } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export const getTradingSuggestions = async (portfolio: PortfolioState, currentSymbol: string, currentPrice: number) => {
  try {
    const prompt = `
      You are an expert trading assistant. The user is playing a trading simulator where they start with $100 and try to reach $1,000,000.
      
      Current Portfolio:
      - Cash Balance: $${portfolio.balance.toFixed(2)}
      - Holdings: ${portfolio.holdings.length > 0 ? portfolio.holdings.map(h => `${h.shares} shares of ${h.symbol} @ $${h.averagePrice.toFixed(2)}`).join(', ') : 'None'}
      
      Currently Viewing: ${currentSymbol} at $${currentPrice.toFixed(2)}
      
      Provide a brief, engaging, and educational suggestion for the user. Keep it under 3 sentences. 
      Analyze their portfolio and the current stock they are viewing. Give them a tip on risk management or a potential strategy.
      Do not give direct financial advice, frame it as educational for the simulator.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Keep an eye on the market trends and manage your risk carefully.";
  } catch (error) {
    console.error("Error getting AI suggestions:", error);
    return "AI suggestions are currently unavailable. Remember to diversify and manage your risk!";
  }
};
