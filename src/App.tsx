import { useState } from 'react';
import StockSearch from './components/StockSearch';
import StockMetrics from './components/StockMetrics';
import StockRecommendation from './components/StockRecommendation';
import StockGraph from './components/StockGraph';
import { StockData } from './types';

function App() {
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-800 mb-2">Stock Analysis Tool</h1>
          <p className="text-gray-600">Comprehensive stock evaluation and recommendations</p>
        </header>

        <StockSearch onStockSelect={setSelectedStock} />

        {selectedStock && (
          <div className="mt-8 space-y-8">
            <div className="max-w-5xl mx-auto">
              <StockMetrics stock={selectedStock} />
            </div>
            
            <div className="max-w-5xl mx-auto">
              <StockRecommendation stock={selectedStock} />
            </div>
            
            <div className="max-w-5xl mx-auto">
              <StockGraph stock={selectedStock} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;