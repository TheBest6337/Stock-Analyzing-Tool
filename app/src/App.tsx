import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import StockSearch from './components/StockSearch';
import StockMetrics from './components/StockMetrics';
import StockRecommendation from './components/StockRecommendation';
import StockGraph from './components/StockGraph';
import StockNews from './components/StockNews';
import { StockData } from './types';
import { Sun, Moon } from 'lucide-react';

function App() {
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  return (
    <div className={`min-h-screen ${isDarkMode ? 'dark' : 'light'}`}>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: isDarkMode ? '#1f2937' : '#ffffff',
            color: isDarkMode ? '#ffffff' : '#000000',
          },
          success: {
            iconTheme: {
              primary: '#10B981',
              secondary: 'white',
            },
          },
          error: {
            iconTheme: {
              primary: '#EF4444',
              secondary: 'white',
            },
          },
        }}
      />
      <div className="container mx-auto px-4 py-8">
        <header className="text-center mb-12 relative">
          <h1 className="text-4xl font-bold mb-2">Stock Analyzer</h1>
          <p>Comprehensive stock evaluation and recommendations</p>
          <button
            onClick={toggleDarkMode}
            className="absolute top-4 right-4 p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
          >
            {isDarkMode ? <Sun /> : <Moon />}
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

            <div className="max-w-5xl mx-auto">
              <StockNews symbol={selectedStock.symbol} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
