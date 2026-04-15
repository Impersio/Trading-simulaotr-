import React, { useState, useEffect } from 'react';
import { PortfolioState, Transaction } from '../types';
import { TradingViewChart } from './TradingViewChart';
import { OrderPanel } from './OrderPanel';
import { Portfolio } from './Portfolio';
import { AISuggestions } from './AISuggestions';
import { getQuote } from '../services/api';
import { Search, TrendingUp, DollarSign, Target, Activity, LogOut } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { SignIn } from './SignIn';
import axios from 'axios';

const INITIAL_BALANCE = 1000;
const TARGET_BALANCE = 1000000;

export const Dashboard: React.FC = () => {
  const { user, loading, signOut } = useAuth();
  const [portfolio, setPortfolio] = useState<PortfolioState>({ balance: INITIAL_BALANCE, holdings: [], transactions: [] });
  const [currentSymbol, setCurrentSymbol] = useState('AAPL');
  const [searchInput, setSearchInput] = useState('');
  const [currentPrice, setCurrentPrice] = useState<number>(0);
  const [portfolioValue, setPortfolioValue] = useState<number>(0);
  const [isSyncing, setIsSyncing] = useState(true);

  // Fetch portfolio from backend
  useEffect(() => {
    if (!user) return;
    
    const fetchPortfolio = async () => {
      try {
        const res = await axios.get('/api/portfolio');
        if (res.data.portfolio) {
          setPortfolio(res.data.portfolio);
        }
      } catch (err) {
        console.error("Failed to fetch portfolio", err);
      } finally {
        setIsSyncing(false);
      }
    };
    
    fetchPortfolio();
  }, [user]);

  // Fetch current price for AI and portfolio value
  useEffect(() => {
    const fetchCurrentPrice = async () => {
      try {
        const quote = await getQuote(currentSymbol);
        setCurrentPrice(quote.price);
      } catch (e) {
        console.error(e);
      }
    };
    fetchCurrentPrice();
    const interval = setInterval(fetchCurrentPrice, 10000);
    return () => clearInterval(interval);
  }, [currentSymbol]);

  // Calculate total portfolio value
  useEffect(() => {
    const calculateValue = async () => {
      let value = portfolio.balance;
      for (const holding of portfolio.holdings) {
        try {
          const quote = await getQuote(holding.symbol);
          value += quote.price * holding.shares;
        } catch (e) {
          // Fallback to average price if fetch fails
          value += holding.averagePrice * holding.shares;
        }
      }
      setPortfolioValue(value);
    };
    calculateValue();
    const interval = setInterval(calculateValue, 15000);
    return () => clearInterval(interval);
  }, [portfolio]);

  const updateBackend = async (newState: PortfolioState) => {
    if (!user) return;
    try {
      await axios.put('/api/portfolio', { portfolio: newState });
    } catch (error) {
      console.error("Error updating portfolio:", error);
    }
  };

  const resetPortfolio = () => {
    if (window.confirm("Are you sure you want to reset your portfolio back to $1,000?")) {
      const newState = { balance: INITIAL_BALANCE, holdings: [], transactions: [] };
      setPortfolio(newState);
      setPortfolioValue(INITIAL_BALANCE);
      updateBackend(newState);
    }
  };

  const addFunds = () => {
    const newState = {
      ...portfolio,
      balance: portfolio.balance + 1000,
      transactions: [
        {
          id: Math.random().toString(36).substring(7),
          symbol: 'DEPOSIT',
          type: 'BUY' as const,
          shares: 1000,
          price: 1,
          timestamp: Date.now()
        },
        ...portfolio.transactions
      ].slice(0, 50)
    };
    setPortfolio(newState);
    updateBackend(newState);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setCurrentSymbol(searchInput.toUpperCase().trim());
      setSearchInput('');
    }
  };

  const handleTrade = (type: 'BUY' | 'SELL', shares: number, price: number) => {
    const newHoldings = [...portfolio.holdings];
    let newBalance = portfolio.balance;
    
    const holdingIndex = newHoldings.findIndex(h => h.symbol === currentSymbol);
    
    if (type === 'BUY') {
      newBalance -= shares * price;
      if (holdingIndex >= 0) {
        const h = newHoldings[holdingIndex];
        const totalCost = (h.shares * h.averagePrice) + (shares * price);
        h.shares += shares;
        h.averagePrice = totalCost / h.shares;
      } else {
        newHoldings.push({ symbol: currentSymbol, shares, averagePrice: price });
      }
    } else {
      newBalance += shares * price;
      if (holdingIndex >= 0) {
        newHoldings[holdingIndex].shares -= shares;
        if (newHoldings[holdingIndex].shares <= 0.0001) { // Handle floating point issues
          newHoldings.splice(holdingIndex, 1);
        }
      }
    }

    const transaction: Transaction = {
      id: Math.random().toString(36).substring(7),
      symbol: currentSymbol,
      type,
      shares,
      price,
      timestamp: Date.now()
    };

    const newState = {
      balance: newBalance,
      holdings: newHoldings,
      transactions: [transaction, ...portfolio.transactions].slice(0, 50)
    };

    setPortfolio(newState);
    updateBackend(newState);
  };

  if (loading) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Loading...</div>;
  }

  if (!user) {
    return <SignIn />;
  }

  if (isSyncing) {
    return <div className="min-h-screen bg-black flex items-center justify-center text-white">Syncing portfolio...</div>;
  }

  const currentHolding = portfolio.holdings.find(h => h.symbol === currentSymbol);
  const currentShares = currentHolding ? currentHolding.shares : 0;
  
  const totalGain = portfolioValue - INITIAL_BALANCE;
  const totalGainPercent = (totalGain / INITIAL_BALANCE) * 100;
  const progressToMillion = (portfolioValue / TARGET_BALANCE) * 100;

  return (
    <div className="min-h-screen bg-black text-gray-100 font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-6 h-6 text-blue-500" />
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent">
              TradeSim
            </h1>
          </div>
          
          <form onSubmit={handleSearch} className="flex-1 max-w-md mx-8 relative">
            <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" />
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search symbol (e.g., TSLA, MSFT)..."
              className="w-full bg-gray-800 border border-gray-700 rounded-full py-2 pl-10 pr-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
            />
          </form>

          <div className="flex items-center gap-6">
            <button 
              onClick={addFunds}
              className="hidden sm:block text-xs bg-gray-800 hover:bg-gray-700 text-gray-300 px-3 py-1.5 rounded-lg border border-gray-700 transition-colors"
            >
              + $1,000
            </button>
            <button 
              onClick={resetPortfolio}
              className="hidden sm:block text-xs bg-red-900/30 hover:bg-red-900/50 text-red-400 px-3 py-1.5 rounded-lg border border-red-900/50 transition-colors"
            >
              Reset
            </button>
            <div className="text-right hidden md:block">
              <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Net Worth</div>
              <div className="text-lg font-bold font-mono text-white">
                ${portfolioValue.toFixed(2)}
              </div>
            </div>
            <div className="text-right hidden lg:block">
              <div className="text-xs text-gray-400 font-medium uppercase tracking-wider">Total Return</div>
              <div className={`text-sm font-bold font-mono ${totalGain >= 0 ? 'text-green-500' : 'text-red-500'}`}>
                {totalGain >= 0 ? '+' : ''}{totalGainPercent.toFixed(2)}%
              </div>
            </div>
            <button 
              onClick={signOut}
              className="text-gray-400 hover:text-white transition-colors"
              title="Sign Out"
            >
              <LogOut className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Progress Bar */}
        <div className="mb-8 bg-gray-900 rounded-xl p-6 border border-gray-800 shadow-lg">
          <div className="flex justify-between items-end mb-2">
            <div>
              <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider flex items-center gap-2">
                <Target className="w-4 h-4" />
                Road to $1,000,000
              </h3>
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold font-mono text-white">${portfolioValue.toFixed(2)}</span>
              <span className="text-gray-500 ml-2">/ $1M</span>
            </div>
          </div>
          <div className="w-full bg-gray-800 rounded-full h-3 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-blue-500 to-indigo-500 h-3 rounded-full transition-all duration-1000 ease-out relative"
              style={{ width: `${Math.min(Math.max(progressToMillion, 0.5), 100)}%` }}
            >
              <div className="absolute inset-0 bg-white/20 animate-pulse"></div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Chart Area */}
          <div className="lg:col-span-2 space-y-8">
            <TradingViewChart key={currentSymbol} symbol={currentSymbol} />
            <Portfolio holdings={portfolio.holdings} onSelectSymbol={setCurrentSymbol} />
          </div>

          {/* Sidebar */}
          <div className="space-y-8">
            <OrderPanel 
              symbol={currentSymbol} 
              balance={portfolio.balance} 
              currentShares={currentShares}
              onTrade={handleTrade}
            />
            <AISuggestions 
              portfolio={portfolio} 
              currentSymbol={currentSymbol} 
              currentPrice={currentPrice} 
            />
            
            {/* Recent Transactions */}
            {portfolio.transactions.length > 0 && (
              <div className="bg-gray-900 rounded-xl p-6 border border-gray-800">
                <h3 className="text-lg font-bold text-white mb-4">Recent Activity</h3>
                <div className="space-y-3">
                  {portfolio.transactions.slice(0, 5).map(tx => (
                    <div key={tx.id} className="flex justify-between items-center text-sm border-b border-gray-800 pb-2 last:border-0">
                      <div>
                        <span className={`font-bold ${tx.type === 'BUY' ? 'text-green-500' : 'text-red-500'}`}>
                          {tx.type}
                        </span>
                        <span className="text-white ml-2">{tx.symbol}</span>
                      </div>
                      <div className="text-right">
                        <div className="text-white font-mono">{tx.shares} @ ${tx.price.toFixed(2)}</div>
                        <div className="text-gray-500 text-xs">
                          {new Date(tx.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};
