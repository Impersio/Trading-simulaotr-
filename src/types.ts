export interface Holding {
  symbol: string;
  shares: number;
  averagePrice: number;
}

export interface Transaction {
  id: string;
  symbol: string;
  type: 'BUY' | 'SELL';
  shares: number;
  price: number;
  timestamp: number;
}

export interface Quote {
  symbol: string;
  price: number;
  previousClose: number;
  currency: string;
}

export interface PortfolioState {
  balance: number;
  holdings: Holding[];
  transactions: Transaction[];
}
