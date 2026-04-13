import React, { useEffect, useState } from 'react';
import { PortfolioState } from '../types';
import { getTradingSuggestions } from '../services/ai';
import { Sparkles, Loader2 } from 'lucide-react';

interface AISuggestionsProps {
  portfolio: PortfolioState;
  currentSymbol: string;
  currentPrice: number;
}

export const AISuggestions: React.FC<AISuggestionsProps> = ({ portfolio, currentSymbol, currentPrice }) => {
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    
    const fetchSuggestion = async () => {
      if (!currentPrice) return;
      setLoading(true);
      try {
        const text = await getTradingSuggestions(portfolio, currentSymbol, currentPrice);
        if (mounted) setSuggestion(text);
      } catch (e) {
        console.error(e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    // Debounce fetching suggestions when symbol changes
    const timer = setTimeout(fetchSuggestion, 1500);
    return () => {
      mounted = false;
      clearTimeout(timer);
    };
  }, [portfolio, currentSymbol, currentPrice]);

  return (
    <div className="bg-gradient-to-br from-indigo-900/50 to-purple-900/50 rounded-xl p-6 border border-indigo-500/30 shadow-lg relative overflow-hidden">
      <div className="absolute top-0 right-0 p-4 opacity-10">
        <Sparkles className="w-24 h-24" />
      </div>
      
      <h2 className="text-lg font-bold text-indigo-300 mb-3 flex items-center gap-2">
        <Sparkles className="w-5 h-5" />
        AI Trading Assistant
      </h2>
      
      <div className="relative z-10 min-h-[80px]">
        {loading ? (
          <div className="flex items-center gap-3 text-indigo-200/70">
            <Loader2 className="w-5 h-5 animate-spin" />
            Analyzing market conditions...
          </div>
        ) : (
          <p className="text-indigo-100 leading-relaxed text-sm">
            {suggestion || "Select a stock to get AI-powered insights and risk management tips."}
          </p>
        )}
      </div>
    </div>
  );
};
