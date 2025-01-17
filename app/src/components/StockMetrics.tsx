import React from 'react';
import { TrendingUp, DollarSign, BarChart3 } from 'lucide-react';
import { StockData } from '../types';

interface Props {
  stock: StockData;
}

export default function StockMetrics({ stock }: Props) {
  const getMetricEvaluation = (metric: string, value: number): { status: string; color: string } => {
    switch (metric) {
      case 'pe':
        return value < 0 ? 
          { status: 'Negative', color: 'text-orange-600' } : 
          value < 15 ? 
            { status: 'Undervalued', color: 'text-green-600' } : 
            value > 30 ? 
              { status: 'Overvalued', color: 'text-red-600' } : 
              { status: 'Fair Value', color: 'text-yellow-600' };
      case 'ps':
        return value < 2 ? 
          { status: 'Undervalued', color: 'text-green-600' } : 
          value > 5 ? 
            { status: 'Overvalued', color: 'text-red-600' } : 
            { status: 'Fair Value', color: 'text-yellow-600' };
      case 'volume':
        return value > 50000000 ? 
          { status: 'High Activity', color: 'text-green-600' } : 
          value > 20000000 ? 
            { status: 'Moderate Activity', color: 'text-blue-600' } : 
            value > 5000000 ?
              { status: 'Low Activity', color: 'text-yellow-600' } :
              { status: 'Very Low Activity', color: 'text-red-600' };
      default:
        return { status: 'Neutral', color: 'text-gray-600' };
    }
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-semibold mb-6">Key Metrics Analysis</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <MetricCard
          title="P/E Ratio"
          value={stock.metrics.pe}
          icon={<TrendingUp />}
          evaluation={getMetricEvaluation('pe', stock.metrics.pe)}
        />
        <MetricCard
          title="P/S Ratio"
          value={stock.metrics.ps}
          icon={<DollarSign />}
          evaluation={getMetricEvaluation('ps', stock.metrics.ps)}
        />
        <MetricCard
          title="Trading Volume"
          value={`${(stock.metrics.volume / 1000000).toFixed(1)}M`}
          icon={<BarChart3 />}
          evaluation={getMetricEvaluation('volume', stock.metrics.volume)}
        />
      </div>
    </div>
  );
}

interface MetricCardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  evaluation: { status: string; color: string };
}

function MetricCard({ title, value, icon, evaluation }: MetricCardProps) {
  return (
    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
      <div className="flex items-center mb-2">
        <span className="text-gray-600 dark:text-gray-300">{icon}</span>
        <h3 className="ml-2 font-medium text-gray-800 dark:text-gray-100">{title}</h3>
      </div>
      <div className="mt-2">
        <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{value}</p>
        <p className={`mt-1 ${evaluation.color}`}>{evaluation.status}</p>
      </div>
    </div>
  );
}
