import React, { useEffect, useState } from 'react';
import { Holding } from '../types';
import { getQuote } from '../services/api';
import { Loader2 } from 'lucide-react';

interface PortfolioProps {
  holdings: Holding[];
  onSelectSymbol: (symbol: string) => void;
}

export const Portfolio: React.FC<PortfolioProps> = ({ holdings, onSelectSymbol }) => {
  const [currentPrices, setCurrentPrices] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    const fetchPrices = async () => {
      if (holdings.length === 0) return;
      setLoading(true);
      try {
        const prices: Record<string, number> = {};
        await Promise.all(
          holdings.map(async (h) => {
            try {
              const quote = await getQuote(h.symbol);
              prices[h.symbol] = quote.price;
            } catch (e) {
              console.error(`Failed to fetch price for ${h.symbol}`);
            }
          })
        );
        if (mounted) setCurrentPrices(prices);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchPrices();
    const interval = setInterval(fetchPrices, 15000);
    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [holdings]);

  if (holdings.length === 0) {
    return (
      <div className="bg-gray-900 rounded-xl p-6 border border-gray-800 text-center text-gray-500">
        Your portfolio is empty. Start trading to build wealth!
      </div>
    );
  }

  return (
    <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
      <div className="px-6 py-4 border-b border-gray-800 flex justify-between items-center">
        <h2 className="text-lg font-bold text-white">Your Holdings</h2>
        {loading && <Loader2 className="w-4 h-4 animate-spin text-gray-500" />}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm text-gray-400">
          <thead className="bg-gray-800/50 text-xs uppercase">
            <tr>
              <th className="px-6 py-3 font-medium">Symbol</th>
              <th className="px-6 py-3 font-medium text-right">Shares</th>
              <th className="px-6 py-3 font-medium text-right">Avg Price</th>
              <th className="px-6 py-3 font-medium text-right">Current</th>
              <th className="px-6 py-3 font-medium text-right">Total Value</th>
              <th className="px-6 py-3 font-medium text-right">Return</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {holdings.map((h) => {
              const currentPrice = currentPrices[h.symbol] || h.averagePrice;
              const totalValue = h.shares * currentPrice;
              const totalCost = h.shares * h.averagePrice;
              const returnAmount = totalValue - totalCost;
              const returnPercent = (returnAmount / totalCost) * 100;
              const isPositive = returnAmount >= 0;

              return (
                <tr 
                  key={h.symbol} 
                  className="hover:bg-gray-800/50 cursor-pointer transition-colors"
                  onClick={() => onSelectSymbol(h.symbol)}
                >
                  <td className="px-6 py-4 font-bold text-white">{h.symbol}</td>
                  <td className="px-6 py-4 text-right font-mono">{h.shares.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right font-mono">${h.averagePrice.toFixed(2)}</td>
                  <td className="px-6 py-4 text-right font-mono">
                    {currentPrices[h.symbol] ? `$${currentPrice.toFixed(2)}` : '...'}
                  </td>
                  <td className="px-6 py-4 text-right font-mono font-medium text-white">
                    ${totalValue.toFixed(2)}
                  </td>
                  <td className={`px-6 py-4 text-right font-mono font-medium ${isPositive ? 'text-green-500' : 'text-red-500'}`}>
                    {isPositive ? '+' : ''}{returnAmount.toFixed(2)} ({isPositive ? '+' : ''}{returnPercent.toFixed(2)}%)
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
