import React, { useState } from 'react';
import { StockData, TimeRange, HistoricalDataPoint } from '../types';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartOptions,
  ScriptableContext,
  ChartEvent
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

interface StockGraphProps {
  stock: StockData;
}

const StockGraph: React.FC<StockGraphProps> = ({ stock }) => {
  const [timeRange, setTimeRange] = useState<TimeRange>('1M');
  const [hoverValue, setHoverValue] = useState<{ price: number; change: number } | null>(null);
  
  if (!stock.historicalData?.length) {
    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg text-center text-gray-600 dark:text-gray-300">
        No historical data available
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

  const getPercentageColor = (percentage: number) => {
    return percentage >= 0 ? 'rgb(34, 197, 94)' : 'rgb(239, 68, 68)';
  };

  const filteredData = () => {
    const data = [...stock.historicalData];
    
    switch(timeRange) {
      case '1W':
        return data.slice(-7);
      case '1M':
        return data.slice(-30);
      case '3M':
        return data.slice(-90);
      case '1Y':
        return data;
      default:
        return data;
    }
  };

  const currentData = filteredData();
  const percentageChange = calculatePercentageChange(currentData);
  const lineColor = getPercentageColor(percentageChange);

  const chartData = {
    labels: currentData.map(d => d.date),
    datasets: [
      {
        label: `${stock.symbol} Price`,
        data: currentData.map(d => d.price),
        borderColor: lineColor,
        backgroundColor: lineColor,
        tension: 0.4,
        borderWidth: 2,
        pointRadius: 0,
        pointHoverRadius: 5,
        cubicInterpolationMode: 'monotone' as const
      }
    ]
  };

  const getMostRecentValues = () => {
    const lastPrice = currentData[currentData.length - 1].price;
    const firstPrice = currentData[0].price;
    const changePercent = ((lastPrice - firstPrice) / firstPrice) * 100;
    return { price: lastPrice, change: changePercent };
  };

  const displayValues = hoverValue || getMostRecentValues();

  const options: ChartOptions<'line'> = {
    responsive: true,
    maintainAspectRatio: true,
    aspectRatio: 2,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        display: false, // Hide legend since we show value above
      },
      tooltip: {
        enabled: false, // Disable default tooltip
      },
    },
    onHover: (event: ChartEvent, elements: any[]) => {
      if (!event || !elements) return;
      
      const newValue = elements.length > 0
        ? (() => {
            const dataIndex = elements[0].index;
            const currentPrice = currentData[dataIndex].price;
            const startPrice = currentData[0].price;
            const changePercent = ((currentPrice - startPrice) / startPrice) * 100;
            return { price: currentPrice, change: changePercent };
          })()
        : getMostRecentValues();

      if (!hoverValue || 
          hoverValue.price !== newValue.price || 
          hoverValue.change !== newValue.change) {
        setHoverValue(newValue);
      }
    },
    scales: {
      x: {
        ticks: {
          maxRotation: 45,
          minRotation: 45,
          autoSkip: true,
          maxTicksLimit: 10,
          callback: (value: number | string): string => {
            const index = typeof value === 'string' ? parseInt(value, 10) : value;
            const date = new Date(currentData[index].date);
            return new Intl.DateTimeFormat('en-US', {
              month: 'short',
              day: 'numeric'
            }).format(date);
          }
        },
        grid: {
          display: false
        }
      },
      y: {
        beginAtZero: false,
        ticks: {
          callback: (value: number): string => {
            return '$' + value.toFixed(2);
          }
        }
      }
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg h-full">
      <div className="flex items-center justify-between mb-4">
        <div className="text-lg font-semibold space-y-1">
          <div className="text-gray-900 dark:text-gray-100">
            ${displayValues.price.toFixed(2)}
          </div>
          <div className={`${
            displayValues.change >= 0 ? 'text-green-500' : 'text-red-500'
          }`}>
            {displayValues.change >= 0 ? '+' : ''}
            {displayValues.change.toFixed(2)}%
          </div>
        </div>
        <div className="flex space-x-2">
          {timeRangeOptions.map((range) => (
            <button
              key={range}
              onClick={() => setTimeRange(range)}
              className={`px-3 py-1 rounded ${
                timeRange === range 
                  ? 'bg-blue-500 text-white' 
                  : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600'
              }`}
            >
              {range}
            </button>
          ))}
        </div>
      </div>
      <div className="relative">
        <Line 
          options={options} 
          data={chartData}
          plugins={[{
            id: 'crosshair',
            afterDraw: (chart: any) => {
              if (chart.tooltip?._active?.length) {
                let x = chart.tooltip._active[0].element.x;
                let yAxis = chart.scales.y;
                let ctx = chart.ctx;
                ctx.save();
                ctx.beginPath();
                ctx.moveTo(x, yAxis.top);
                ctx.lineTo(x, yAxis.bottom);
                ctx.lineWidth = 1;
                ctx.strokeStyle = 'rgba(0, 0, 0, 0.1)';
                ctx.stroke();
                ctx.restore();
              }
            }
          }]}
        />
      </div>
    </div>
  );
};

export default StockGraph;
