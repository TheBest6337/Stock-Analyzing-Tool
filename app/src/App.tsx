import { useState } from 'react';
import StockSearch from './components/StockSearch';
import StockMetrics from './components/StockMetrics';
import StockRecommendation from './components/StockRecommendation';
import StockGraph from './components/StockGraph';
import { StockData } from './types';

function App() {
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'bg-gray-900 text-white' : 'bg-gradient-to-br from-gray-50 to-gray-100'}`}>
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-2">{isDarkMode ? 'Dark Mode' : 'Light Mode'}</h1>
          <p>Comprehensive stock evaluation and recommendations</p>
          <button
            onClick={toggleDarkMode}
            className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Toggle {isDarkMode ? 'Light' : 'Dark'} Mode
          </button>
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
