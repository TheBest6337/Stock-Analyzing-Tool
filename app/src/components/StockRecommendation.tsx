import { AlertCircle } from 'lucide-react';
import { StockData } from '../types';
import React, { useState, useEffect } from 'react';
import { getPeerMetrics } from '../services/stockApi';

interface Props {
  stock: StockData;
}

export default function StockRecommendation({ stock }: Props) {
  const [score, setScore] = useState<number | null>(null);

  const fetchPeerMetrics = async (symbol: string) => {
    return await getPeerMetrics(symbol);
  };

  const calculateScore = async (): Promise<number> => {
    let score = 0;
    
    // Fetch peer metrics
    const peerMetrics = await fetchPeerMetrics(stock.symbol);

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

    // Peer Comparison Score (0-25 points)
    if (stock.metrics.pe < peerMetrics.pe) score += 10;
    if (stock.metrics.ps < peerMetrics.ps) score += 10;
    if (stock.metrics.volume > peerMetrics.volume) score += 5;
    
    return score;
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
    if (score === null) return 'Calculating...';
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

  const PeerMetrics = ({ peerMetrics }: { peerMetrics: any[] }) => {
    return (
      <div className="mt-6">
        <h3 className="text-lg font-semibold mb-2">Peer Metrics</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {peerMetrics.map((peer, index) => (
            <div key={index} className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4">
              <h4 className="font-medium text-gray-800 dark:text-gray-100">{peer.symbol}</h4>
              <p className="text-sm text-gray-600 dark:text-gray-300">P/E: {peer.pe}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">P/S: {peer.ps}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Volume: {peer.volume}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Current Ratio: {peer.currentRatio}</p>
              <p className="text-sm text-gray-600 dark:text-gray-300">Debt to Equity: {peer.debtToEquity}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <h2 className="text-2xl font-semibold mb-6">Investment Recommendation</h2>
      
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center">
          <AlertCircle className="text-blue-600 dark:text-blue-400 mr-2" />
          <span className="text-lg font-medium">Overall Score</span>
        </div>
        <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">{score !== null ? `${score}/100` : 'Calculating...'}</div>
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

      <PeerMetrics peerMetrics={stock.peerMetrics} />
    </div>
  );
}
