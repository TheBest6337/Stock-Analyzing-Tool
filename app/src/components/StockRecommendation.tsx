import { AlertCircle } from 'lucide-react';
import { StockData } from '../types';

interface Props {
  stock: StockData;
}

export default function StockRecommendation({ stock }: Props) {
  const calculateScore = async (): Promise<number> => {
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

    // Historical Performance Score (0-25 points)
    const historicalPerformanceScore = calculateHistoricalPerformanceScore(stock.historicalData);
    score += historicalPerformanceScore;

    // Peer Comparison Score (0-25 points)
    const comparisonCompanies = await getComparisonCompanies(stock.symbol);
    const peerComparisonScore = calculatePeerComparisonScore(stock, comparisonCompanies);
    score += peerComparisonScore;
    
    return score;
  };

  const calculateHistoricalPerformanceScore = (historicalData: HistoricalDataPoint[]): number => {
    // Implement logic to calculate score based on historical performance
    // For simplicity, let's assume we give a score based on the average price change over the past year
    if (historicalData.length < 2) return 0;

    const firstPrice = historicalData[0].price;
    const lastPrice = historicalData[historicalData.length - 1].price;
    const percentageChange = ((lastPrice - firstPrice) / firstPrice) * 100;

    if (percentageChange > 50) return 25;
    if (percentageChange > 20) return 15;
    if (percentageChange > 0) return 5;
    return 0;
  };

  const getComparisonCompanies = async (symbol: string): Promise<ComparisonCompanyData[]> => {
    // Implement logic to fetch comparison companies' data
    // For simplicity, let's assume we fetch data from an API
    const response = await fetch(`/api/comparison-companies?symbol=${symbol}`);
    const data = await response.json();
    return data;
  };

  const calculatePeerComparisonScore = (stock: StockData, comparisonCompanies: ComparisonCompanyData[]): number => {
    // Implement logic to calculate score based on peer comparison
    // For simplicity, let's assume we compare the P/E and P/S ratios with the average of comparison companies
    const averagePE = comparisonCompanies.reduce((sum, company) => sum + company.metrics.pe, 0) / comparisonCompanies.length;
    const averagePS = comparisonCompanies.reduce((sum, company) => sum + company.metrics.ps, 0) / comparisonCompanies.length;

    let score = 0;
    if (stock.metrics.pe < averagePE) score += 10;
    if (stock.metrics.ps < averagePS) score += 10;

    return score;
  };

  const score = await calculateScore();
  
  const getRecommendationClass = () => {
    if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (score >= 60) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
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
        <div className="mt-4 p-3 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded-lg">
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
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-semibold mb-6">Investment Recommendation</h2>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <AlertCircle className="text-blue-600 dark:text-blue-400 mr-2" />
          <span className="text-lg font-medium">Overall Score</span>
        </div>
        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{score}/100</div>
      </div>

      <div className={`rounded-lg p-4 ${getRecommendationClass()}`}>
        <h3 className="text-lg font-semibold mb-2">Recommendation: {getRecommendationText()}</h3>
        <p className="text-sm">
          This recommendation is based on fundamental analysis including P/E ratio, P/S ratio,
          trading volume, financial health metrics, historical performance, and peer comparison.
          Always conduct your own research before making investment decisions.
        </p>
      </div>

      {getPEWarning()}
    </div>
  );
}
