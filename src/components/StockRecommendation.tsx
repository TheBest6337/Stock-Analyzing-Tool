import { AlertCircle } from 'lucide-react';
import { StockData } from '../types';

interface Props {
  stock: StockData;
}

export default function StockRecommendation({ stock }: Props) {
  const calculateScore = (): number => {
    let score = 0;
    
    // P/E Score (0-25 points)
    if (stock.metrics.pe < 0) {
      score += 5; // High risk score for negative P/E
    } else {
      if (stock.metrics.pe < 15) score += 25;
      else if (stock.metrics.pe < 25) score += 15;
      else if (stock.metrics.pe < 35) score += 5;
    }
    
    // P/S Score (0-25 points)
    if (stock.metrics.ps < 2) score += 25;
    else if (stock.metrics.ps < 4) score += 15;
    else if (stock.metrics.ps < 6) score += 5;
    
    // Volume Score (0-20 points)
    if (stock.metrics.volume > 50000000) score += 20;
    else if (stock.metrics.volume > 20000000) score += 10;
    else if (stock.metrics.volume > 5000000) score += 5;
    
    // Financial Health Score (0-30 points)
    if (stock.metrics.currentRatio > 1.5) score += 15;
    else if (stock.metrics.currentRatio > 1) score += 7;
    
    if (stock.metrics.debtToEquity < 1) score += 15;
    else if (stock.metrics.debtToEquity < 2) score += 7;
    
    return score;
  };

  const score = calculateScore();
  
  const getRecommendationClass = () => {
    if (score >= 80) return 'bg-green-100 text-green-800';
    if (score >= 60) return 'bg-blue-100 text-blue-800';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800';
    return 'bg-red-100 text-red-800';
  };

  const getRecommendationText = () => {
    if (score >= 80) return 'Strong Buy';
    if (score >= 60) return 'Buy';
    if (score >= 40) return 'Hold';
    return 'Not Recommended';
  };

  const getPEWarning = () => {
    if (stock.metrics.pe < 0) {
      return (
        <div className="mt-4 p-3 bg-orange-100 text-orange-800 rounded-lg">
          <p className="font-medium">⚠️ Warning: Negative P/E Ratio</p>
          <p className="text-sm mt-1">
            A negative P/E ratio indicates the company is currently operating at a loss. 
            This could suggest higher investment risk or a company in transition.
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-semibold mb-6">Investment Recommendation</h2>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <AlertCircle className="text-blue-600 mr-2" />
          <span className="text-lg font-medium">Overall Score</span>
        </div>
        <div className="text-3xl font-bold text-blue-600">{score}/100</div>
      </div>

      <div className={`rounded-lg p-4 ${getRecommendationClass()}`}>
        <h3 className="text-lg font-semibold mb-2">Recommendation: {getRecommendationText()}</h3>
        <p className="text-sm">
          This recommendation is based on fundamental analysis including P/E ratio, P/S ratio,
          trading volume, and financial health metrics. Always conduct your own research before
          making investment decisions.
        </p>
      </div>

      {getPEWarning()}
    </div>
  );
}