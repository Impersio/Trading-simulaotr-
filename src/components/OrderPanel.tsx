import React, { useState, useEffect } from 'react';
import { Quote } from '../types';
import { getQuote } from '../services/api';
import { Loader2, TrendingUp, TrendingDown } from 'lucide-react';

interface OrderPanelProps {
  symbol: string;
  balance: number;
  currentShares: number;
  onTrade: (type: 'BUY' | 'SELL', shares: number, price: number) => void;
}

export const OrderPanel: React.FC<OrderPanelProps> = ({ symbol, balance, currentShares, onTrade }) => {
  const [quote, setQuote] = useState<Quote | null>(null);
  const [loading, setLoading] = useState(false);
  const [shares, setShares] = useState<string>('1');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    const fetchQuote = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getQuote(symbol);
        if (mounted) setQuote(data);
      } catch (err) {
        if (mounted) setError('Failed to fetch current price');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchQuote();
    const interval = setInterval(fetchQuote, 10000); // Update every 10s
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [symbol]);

  const handleTrade = (type: 'BUY' | 'SELL') => {
    if (!quote) return;
    const numShares = parseFloat(shares);
    if (isNaN(numShares) || numShares <= 0) {
      setError('Invalid number of shares');
      return;
    }

    if (type === 'BUY') {
      const cost = numShares * quote.price;
      if (cost > balance) {
        setError('Insufficient funds');
        return;
      }
    } else {
      if (numShares > currentShares) {
        setError('Insufficient shares');
        return;
      }
    }

    setError(null);
    onTrade(type, numShares, quote.price);
    setShares('1');
  };

  const isMarketUp = quote ? quote.price >= quote.previousClose : true;

  return (
    <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-xl">
      <h2 className="text-xl font-bold text-white mb-4 flex items-center justify-between">
        <span>Trade {symbol}</span>
        {loading && !quote && <Loader2 className="w-5 h-5 animate-spin text-blue-500" />}
      </h2>

      {quote ? (
        <div className="mb-6">
          <div className="text-3xl font-mono font-bold text-white flex items-center gap-2">
            ${quote.price.toFixed(2)}
            {isMarketUp ? (
              <TrendingUp className="w-6 h-6 text-green-500" />
            ) : (
              <TrendingDown className="w-6 h-6 text-red-500" />
            )}
          </div>
          <div className={`text-sm font-medium ${isMarketUp ? 'text-green-500' : 'text-red-500'}`}>
            {isMarketUp ? '+' : ''}{((quote.price - quote.previousClose) / quote.previousClose * 100).toFixed(2)}% Today
          </div>
        </div>
      ) : (
        <div className="h-20 flex items-center justify-center text-gray-500">
          {error || 'Loading price...'}
        </div>
      )}

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-1">Shares</label>
          <input
            type="number"
            min="0.1"
            step="0.1"
            value={shares}
            onChange={(e) => setShares(e.target.value)}
            className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
            placeholder="0"
          />
        </div>

        {error && <div className="text-red-500 text-sm">{error}</div>}

        <div className="grid grid-cols-2 gap-3">
          <button
            onClick={() => handleTrade('BUY')}
            disabled={!quote || loading}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            BUY
          </button>
          <button
            onClick={() => handleTrade('SELL')}
            disabled={!quote || loading || currentShares === 0}
            className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-bold py-3 px-4 rounded-lg transition-colors"
          >
            SELL
          </button>
        </div>

        <div className="pt-4 border-t border-gray-800 text-sm text-gray-400 flex justify-between">
          <span>Buying Power:</span>
          <span className="font-mono text-white">${balance.toFixed(2)}</span>
        </div>
        <div className="text-sm text-gray-400 flex justify-between">
          <span>Shares Owned:</span>
          <span className="font-mono text-white">{currentShares}</span>
        </div>
      </div>
    </div>
  );
};
