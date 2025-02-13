import { AlertCircle } from 'lucide-react';
import { StockData } from '../types';
import { useState, useEffect } from 'react';
import { getPeerMetrics } from '../services/stockApi';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface Props {
  stock: StockData;
}

export default function StockRecommendation({ stock }: Props) {
  const { t } = useTranslation();
  const [score, setScore] = useState<number | null>(null);
  const [scoreBreakdown, setScoreBreakdown] = useState<{ [key: string]: number }>({});
  const [error, setError] = useState<string | null>(null);

  const fetchPeerMetrics = async (symbol: string) => {
    return await getPeerMetrics(symbol);
  };

  const calculateMetricScore = (value: number, ranges: [number, number][], scores: number[]): number => {
    for (let i = 0; i < ranges.length; i++) {
      const [min, max] = ranges[i];
      if (value >= min && (max === Infinity || value <= max)) {
        return scores[i];
      }
    }
    return 0;
  };

  const calculateTrendScore = (historicalData: { date: string; price: number }[]): number => {
    if (historicalData.length < 2) return 0;
    
    const prices = historicalData.map(d => d.price);
    
    // Calculate overall trend using linear regression
    const n = prices.length;
    const x = Array.from({ length: n }, (_, i) => i);
    const sumX = x.reduce((a, b) => a + b, 0);
    const sumY = prices.reduce((a, b) => a + b, 0);
    const sumXY = x.reduce((sum, xi, i) => sum + xi * prices[i], 0);
    const sumXX = x.reduce((sum, xi) => sum + xi * xi, 0);
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const startPrice = prices[0];
    const endPrice = prices[prices.length - 1];
    const totalReturn = ((endPrice - startPrice) / startPrice) * 100;
    
    // Combine slope and total return for trend strength
    const trendStrength = (Math.sign(slope) * Math.abs(totalReturn) + 100) / 2;
    
    return calculateMetricScore(
      trendStrength,
      [[0, 30], [30, 45], [45, 55], [55, 70], [70, 100]],
      [0, 2.5, 5, 7.5, 10]
    );
  };

  const calculateVolatilityScore = (historicalData: { date: string; price: number }[]): number => {
    if (historicalData.length < 2) return 0;
    
    const prices = historicalData.map(d => d.price);
    // Calculate daily returns
    const returns = prices.slice(1).map((price, i) => (price - prices[i]) / prices[i]);
    
    // Calculate annualized volatility
    const dailyVolatility = Math.sqrt(returns.reduce((sum, ret) => sum + ret * ret, 0) / returns.length);
    const annualizedVolatility = dailyVolatility * Math.sqrt(252);
    
    // Calculate average true range for more context
    const atr = prices.slice(1).reduce((sum, price, i) => {
      const highLow = Math.abs(price - prices[i]);
      return sum + highLow;
    }, 0) / (prices.length - 1);
    
    // Combine volatility measures
    const volatilityScore = (annualizedVolatility * 0.7 + (atr / prices[prices.length - 1]) * 0.3);
    
    return calculateMetricScore(
      volatilityScore,
      [[0, 0.15], [0.15, 0.25], [0.25, 0.35], [0.35, 0.5], [0.5, Infinity]],
      [5, 4, 3, 1, 0]
    );
  };

  const calculateScore = async (): Promise<number> => {
    const loadingToast = toast.loading(t('Calculating recommendation score...'));
    try {
      const breakdown: { [key: string]: number } = {};
      let totalScore = 0;
      
      // Fetch peer metrics
      const peerMetrics = await fetchPeerMetrics(stock.symbol);

      if (!peerMetrics || peerMetrics.length === 0) {
        toast.error(t('No peer metrics available'), { id: loadingToast });
        return totalScore;
      }

      // Calculate average peer metrics
      const avgPeerMetrics = {
        pe: peerMetrics.reduce((acc, peer) => acc + peer.pe, 0) / peerMetrics.length,
        ps: peerMetrics.reduce((acc, peer) => acc + peer.ps, 0) / peerMetrics.length,
        volume: peerMetrics.reduce((acc, peer) => acc + peer.volume, 0) / peerMetrics.length,
        currentRatio: peerMetrics.reduce((acc, peer) => acc + peer.currentRatio, 0) / peerMetrics.length,
        debtToEquity: peerMetrics.reduce((acc, peer) => acc + peer.debtToEquity, 0) / peerMetrics.length
      };

      // 1. Valuation Metrics (30 points total)
      let valuationScore = 0;
      
      // P/E Score (0-15 points)
      if (stock.metrics.pe > 0) {
        valuationScore += calculateMetricScore(
          stock.metrics.pe,
          [[0, 15], [15, 25], [25, 35], [35, 50], [50, Infinity]],
          [15, 12, 8, 4, 0]
        );
      } else {
        valuationScore += 3; // Negative P/E gets a low score
      }
      
      // P/S Score (0-15 points)
      valuationScore += calculateMetricScore(
        stock.metrics.ps,
        [[0, 2], [2, 4], [4, 6], [6, 10], [10, Infinity]],
        [15, 12, 8, 4, 0]
      );
      
      breakdown.valuation = valuationScore;
      totalScore += valuationScore;

      // 2. Financial Health (25 points total)
      let healthScore = 0;
      
      // Current Ratio (0-12 points)
      healthScore += calculateMetricScore(
        stock.metrics.currentRatio,
        [[0, 1], [1, 1.5], [1.5, 2], [2, 3], [3, Infinity]],
        [3, 6, 12, 9, 6]
      );
      
      // Debt to Equity (0-13 points)
      healthScore += calculateMetricScore(
        stock.metrics.debtToEquity,
        [[0, 0.3], [0.3, 0.6], [0.6, 1], [1, 2], [2, Infinity]],
        [13, 10, 7, 4, 0]
      );
      
      breakdown.health = healthScore;
      totalScore += healthScore;

      // 3. Market Activity (15 points total)
      const volumeScore = calculateMetricScore(
        stock.metrics.volume,
        [[0, 500000], [500000, 2000000], [2000000, 5000000], [5000000, 20000000], [20000000, Infinity]],
        [0, 4, 8, 12, 15]
      );
      
      breakdown.volume = volumeScore;
      totalScore += volumeScore;

      // 4. Peer Comparison (15 points total)
      let peerScore = 0;
      
      if (stock.metrics.pe < avgPeerMetrics.pe && stock.metrics.pe > 0) peerScore += 5;
      if (stock.metrics.ps < avgPeerMetrics.ps) peerScore += 5;
      if (stock.metrics.currentRatio > avgPeerMetrics.currentRatio) peerScore += 3;
      if (stock.metrics.debtToEquity < avgPeerMetrics.debtToEquity) peerScore += 2;
      
      breakdown.peerComparison = peerScore;
      totalScore += peerScore;

      // 5. Technical Analysis (15 points total)
      const trendScore = calculateTrendScore(stock.historicalData);
      const volatilityScore = calculateVolatilityScore(stock.historicalData);
      
      // Ensure total technical score doesn't exceed 15 points
      const technicalScore = Math.min(trendScore + volatilityScore, 15);
      breakdown.technical = technicalScore;
      totalScore += technicalScore;

      setScoreBreakdown(breakdown);
      toast.success(t('Score calculated successfully'), { id: loadingToast });
      return Math.round(totalScore);
    } catch (err: any) {
      toast.error(t('Failed to calculate recommendation score'), { id: loadingToast });
      return 0;
    }
  };

  useEffect(() => {
    const fetchScore = async () => {
      const calculatedScore = await calculateScore();
      setScore(calculatedScore);
    };

    fetchScore();
  }, [stock]);

  const getRecommendationClass = () => {
    if (score === null) return '';
    if (score >= 80) return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
    if (score >= 60) return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
    if (score >= 40) return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  const getRecommendationText = () => {
    if (score === null) return t('Calculating...');
    if (score >= 80) return t('Strong Buy');
    if (score >= 60) return t('Buy');
    if (score >= 40) return t('Hold');
    return t('Not Recommended');
  };

  const getDetailedRecommendation = () => {
    if (!scoreBreakdown) return '';
    
    const recommendations = [];
    if (scoreBreakdown.valuation < 15) {
      recommendations.push(t('Stock may be overvalued compared to its fundamentals.'));
    }
    if (scoreBreakdown.health < 13) {
      recommendations.push(t('Company shows some financial health concerns.'));
    }
    if (scoreBreakdown.volume < 8) {
      recommendations.push(t('Low trading volume indicates potential liquidity risks.'));
    }
    if (scoreBreakdown.peerComparison < 8) {
      recommendations.push(t('Underperforming compared to industry peers.'));
    }
    if (scoreBreakdown.technical < 8) {
      recommendations.push(t('Technical indicators suggest cautious approach.'));
    }
    
    return recommendations.join(' ');
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="border-b dark:border-gray-700 pb-4 mb-6">
        <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">{t('Stock Analysis')}</div>
        <div className="text-3xl font-bold text-gray-900 dark:text-white">{stock.symbol}</div>
        <div className="text-md text-gray-600 dark:text-gray-400">{stock.name}</div>
      </div>
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center">
          <AlertCircle className="text-blue-600 dark:text-blue-400 mr-2" />
          <span className="text-lg font-medium">{t('Overall Score')}</span>
        </div>
        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
          {score !== null ? `${score}/100` : t('Calculating...')}
        </div>
      </div>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded-lg">
          <p className="font-medium">⚠️ {t('Error')}: {error}</p>
          <p className="text-sm mt-1">
            {t('Unable to calculate score due to missing data. Please try again later.')}
          </p>
        </div>
      )}

      <div className={`rounded-lg p-3 mb-4 ${getRecommendationClass()}`}>
        <h3 className="text-base font-semibold mb-1">{t('Recommendation')}: {getRecommendationText()}</h3>
        <p className="text-sm">
          {getDetailedRecommendation() || 
          t('Analysis based on comprehensive evaluation of fundamentals, technical indicators, and peer comparison.')}
        </p>
      </div>

      {scoreBreakdown && (
        <div className="mt-2">
          <h3 className="text-base font-medium mb-2">{t('Score Breakdown')}</h3>
          <div className="grid grid-cols-2 gap-1.5">
            <div className="px-2 py-1.5 bg-gray-50 dark:bg-gray-900 rounded">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{t('Valuation')}</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-500 tabular-nums">{scoreBreakdown.valuation}/30</span>
              </div>
              <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="bg-blue-600 h-full rounded-full transition-all duration-300" style={{ width: `${(scoreBreakdown.valuation / 30) * 100}%` }}></div>
              </div>
            </div>

            <div className="px-2 py-1.5 bg-gray-50 dark:bg-gray-900 rounded">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{t('Health')}</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-500 tabular-nums">{scoreBreakdown.health}/25</span>
              </div>
              <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="bg-green-600 h-full rounded-full transition-all duration-300" style={{ width: `${(scoreBreakdown.health / 25) * 100}%` }}></div>
              </div>
            </div>

            <div className="px-2 py-1.5 bg-gray-50 dark:bg-gray-900 rounded">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{t('Activity')}</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-500 tabular-nums">{scoreBreakdown.volume}/15</span>
              </div>
              <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="bg-purple-600 h-full rounded-full transition-all duration-300" style={{ width: `${(scoreBreakdown.volume / 15) * 100}%` }}></div>
              </div>
            </div>

            <div className="px-2 py-1.5 bg-gray-50 dark:bg-gray-900 rounded">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{t('Peers')}</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-500 tabular-nums">{scoreBreakdown.peerComparison}/15</span>
              </div>
              <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="bg-yellow-600 h-full rounded-full transition-all duration-300" style={{ width: `${(scoreBreakdown.peerComparison / 15) * 100}%` }}></div>
              </div>
            </div>

            <div className="px-2 py-1.5 bg-gray-50 dark:bg-gray-900 rounded col-span-2">
              <div className="flex justify-between items-baseline mb-1">
                <span className="text-xs font-medium text-gray-600 dark:text-gray-400">{t('Technical')}</span>
                <span className="text-[10px] text-gray-500 dark:text-gray-500 tabular-nums">{scoreBreakdown.technical}/15</span>
              </div>
              <div className="h-1 w-full bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                <div className="bg-indigo-600 h-full rounded-full transition-all duration-300" style={{ width: `${(scoreBreakdown.technical / 15) * 100}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      )}

      {stock.metrics.pe < 0 && (
        <div className="mt-4 p-3 bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200 rounded-lg">
          <p className="font-medium">⚠️ {t('Warning: Negative P/E Ratio')}</p>
          <p className="text-sm mt-1">
            {t('A negative P/E ratio indicates the company is currently operating at a loss. This could suggest higher investment risk or a company in transition.')}
          </p>
        </div>
      )}
    </div>
  );
}
