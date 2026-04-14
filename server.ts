import express from 'express';
import cors from 'cors';
import axios from 'axios';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI } from '@google/genai';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // API routes
  app.post('/api/suggestions', async (req, res) => {
    try {
      const { portfolio, currentSymbol, currentPrice } = req.body;
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      
      const prompt = `
        You are an expert trading assistant. The user is playing a trading simulator where they start with $1,000 and try to reach $1,000,000.
        
        Current Portfolio:
        - Cash Balance: $${portfolio.balance.toFixed(2)}
        - Holdings: ${portfolio.holdings.length > 0 ? portfolio.holdings.map((h: any) => `${h.shares} shares of ${h.symbol} @ $${h.averagePrice.toFixed(2)}`).join(', ') : 'None'}
        
        Currently Viewing: ${currentSymbol} at $${currentPrice.toFixed(2)}
        
        Provide a brief, engaging, and educational suggestion for the user. Keep it under 3 sentences. 
        Analyze their portfolio and the current stock they are viewing. Give them a tip on risk management or a potential strategy.
        Do not give direct financial advice, frame it as educational for the simulator.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      res.json({ suggestion: response.text });
    } catch (error) {
      console.error('Error generating suggestion:', error);
      res.status(500).json({ error: 'Failed to generate suggestion' });
    }
  });

  app.get('/api/quote/:symbol', async (req, res) => {
    try {
      const { symbol } = req.params;
      
      // Try query2 first with headers
      try {
        const response = await axios.get(`https://query2.finance.yahoo.com/v8/finance/chart/${symbol}?interval=1m&range=1d`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36',
            'Accept': 'application/json'
          },
          timeout: 5000
        });
        
        if (response.data.chart.result && response.data.chart.result.length > 0) {
          const result = response.data.chart.result[0];
          const meta = result.meta;
          return res.json({
            symbol: meta.symbol,
            price: meta.regularMarketPrice,
            previousClose: meta.chartPreviousClose,
            currency: meta.currency
          });
        }
      } catch (yahooError: any) {
        if (yahooError.response && yahooError.response.status === 404) {
          return res.status(404).json({ error: 'Symbol not found' });
        }
        console.error('Yahoo Finance API error:', yahooError.message);
      }

      // If Yahoo fails, try a fallback (mock data based on symbol length to keep simulator running)
      // In a real app, you'd use another API like Finnhub or Alpha Vantage here.
      console.warn(`Using fallback mock data for ${symbol}`);
      const mockPrice = 100 + (symbol.length * 10) + (Math.random() * 5);
      return res.json({
        symbol: symbol.toUpperCase(),
        price: mockPrice,
        previousClose: mockPrice * 0.98,
        currency: 'USD'
      });

    } catch (error) {
      console.error('Error fetching quote:', error);
      res.status(500).json({ error: 'Failed to fetch quote' });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
