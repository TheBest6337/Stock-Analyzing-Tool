import React, { useState, useCallback, useMemo } from 'react';
import { StockData, TimeRange, HistoricalDataPoint } from '../types';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from 'recharts';
import debounce from 'lodash/debounce';
import { useTranslation } from 'react-i18next';

interface StockGraphProps {
  stock: StockData;
}

const StockGraph: React.FC<StockGraphProps> = ({ stock }) => {
  const { t } = useTranslation();
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  const [tooltipPosition, setTooltipPosition] = useState<{ x: number, y: number } | null>(null);
  const [displayValue, setDisplayValue] = useState<{ price: number; change: number } | null>(null);

  if (!stock.historicalData?.length) {
    return (
      <div className="backdrop-blur-xl bg-white/50 dark:bg-gray-800/50 p-6 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl text-center text-gray-600 dark:text-gray-300">
        {t('No historical data available')}
      </div>
    );
  }

  const timeRangeOptions: TimeRange[] = ['1W', '1M', '3M', '1Y'];

  const calculatePercentageChange = (data: HistoricalDataPoint[]) => {
    if (data.length < 2) return 0;
    const firstPrice = data[0].price;
    const lastPrice = data[data.length - 1].price;
    return ((lastPrice - firstPrice) / firstPrice) * 100;
  };

  const filteredData = () => {
    const data = [...stock.historicalData];
    
    switch(timeRange) {
      case '1W': return data.slice(-7);
      case '1M': return data.slice(-30);
      case '3M': return data.slice(-90);
      case '1Y': return data;
      default: return data;
    }
  };

  const currentData = filteredData();
  const percentageChange = calculatePercentageChange(currentData);
  const isPositive = percentageChange >= 0;
  const gradientColor = isPositive ? '#22c55e' : '#ef4444';

  const formatDate = (date: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(new Date(date));
  };

  const formatPrice = (price: number) => `$${price.toFixed(2)}`;

  const getMostRecentValues = useCallback(() => {
    const lastPrice = currentData[currentData.length - 1].price;
    const firstPrice = currentData[0].price;
    const changePercent = ((lastPrice - firstPrice) / firstPrice) * 100;
    return { price: lastPrice, change: changePercent };
  }, [currentData]);

  const debouncedSetTooltipPosition = useMemo(
    () => debounce((pos: { x: number, y: number } | null) => {
      setTooltipPosition(pos);
    }, 50),
    []
  );

  const CustomTooltip = ({ active, payload, coordinate }: any) => {
    if (active && payload && payload.length) {
      const currentPrice = payload[0].value;
      const firstPrice = currentData[0].price;
      const changePercent = ((currentPrice - firstPrice) / firstPrice) * 100;
      
      // Update display values immediately
      setDisplayValue({ price: currentPrice, change: changePercent });
      // Debounce only the tooltip position
      debouncedSetTooltipPosition(coordinate);

      if (!tooltipPosition) return null;

      return (
        <div
          className="bg-white dark:bg-gray-700 p-3 rounded-lg shadow-lg border border-gray-200 dark:border-gray-600 transform transition-transform duration-75 ease-out"
          style={{
            transform: 'translate(-50%, -100%)',
            position: 'fixed',
            left: tooltipPosition.x,
            top: tooltipPosition.y - 16,
            pointerEvents: 'none'
          }}
        >
          <p className="text-gray-600 dark:text-gray-300">{formatDate(payload[0].payload.date)}</p>
          <p className="font-bold text-gray-900 dark:text-white">{formatPrice(currentPrice)}</p>
        </div>
      );
    }
    return null;
  };

  // Get the values to display (either hover values or most recent)
  const valuesToDisplay = displayValue || getMostRecentValues();

  return (
    <div className="backdrop-blur-xl bg-white/50 dark:bg-gray-800/50 p-8 rounded-xl border border-gray-200 dark:border-gray-700 shadow-xl transition-all duration-300 ease-in-out h-full">
      <div className="flex items-center justify-between mb-6">
        <div className="space-y-2">
          <div className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 transition-colors duration-200">
            ${valuesToDisplay.price.toFixed(2)}
          </div>
          <div className={`text-lg font-medium transition-colors duration-200 ${
            isPositive ? 'text-green-500' : 'text-red-500'
          }`}>
            <span className="inline-flex items-center">
              {isPositive ? (
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 15l7-7 7 7" />
                </svg>
              ) : (
                <svg className="w-4 h-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              )}
              {isPositive ? '+' : ''}{valuesToDisplay.change.toFixed(2)}%
            </span>
          </div>
        </div>
        <div className="flex items-center gap-2 p-1 bg-gray-100/50 dark:bg-gray-700/50 rounded-lg backdrop-blur-sm">
          {timeRangeOptions.map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 ${
                timeRange === range 
                  ? 'bg-blue-500 text-white shadow-md transform scale-105' 
                  : 'hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300'
              }`}
            >
              {t(range)}
            </button>
          ))}
        </div>
      </div>
      <div className="h-[400px] w-full transition-all duration-300">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart
            data={currentData}
            onMouseLeave={() => {
              setDisplayValue(null);
              debouncedSetTooltipPosition(null);
              debouncedSetTooltipPosition.flush();
            }}
            margin={{ top: 10, right: 10, left: 10, bottom: 0 }}
          >
            <defs>
              <linearGradient id="colorGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={gradientColor} stopOpacity={0.3}/>
                <stop offset="95%" stopColor={gradientColor} stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" opacity={0.1} vertical={false} />
            <XAxis
              dataKey="date"
              tickFormatter={formatDate}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6B7280' }}
              minTickGap={30}
              dy={10}
            />
            <YAxis
              tickFormatter={formatPrice}
              tickLine={false}
              axisLine={false}
              tick={{ fill: '#6B7280' }}
              domain={['auto', 'auto']}
              dx={-10}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ 
                stroke: '#6B7280', 
                strokeWidth: 1, 
                strokeDasharray: '3 3'
              }}
              position={{ x: 0, y: 0 }}
              isAnimationActive={false}
            />
            <Area
              type="monotone"
              dataKey="price"
              stroke={gradientColor}
              fill="url(#colorGradient)"
              strokeWidth={2.5}
              animationDuration={550}
              animationEasing="ease-in-out"
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default StockGraph;
