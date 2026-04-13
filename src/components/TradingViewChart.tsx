import React from 'react';
import { AdvancedRealTimeChart } from 'react-ts-tradingview-widgets';

interface TradingViewChartProps {
  symbol: string;
}

export const TradingViewChart: React.FC<TradingViewChartProps> = ({ symbol }) => {
  return (
    <div className="h-[500px] w-full rounded-xl overflow-hidden border border-gray-800 shadow-2xl">
      <AdvancedRealTimeChart
        symbol={symbol}
        theme="dark"
        autosize
        allow_symbol_change={false}
        hide_side_toolbar={false}
        style="1"
        timezone="Etc/UTC"
      />
    </div>
  );
};
