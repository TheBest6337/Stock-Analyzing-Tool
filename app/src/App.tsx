import { useState } from 'react';
import { Toaster } from 'react-hot-toast';
import StockSearch from './components/StockSearch';
import StockMetrics from './components/StockMetrics';
import StockRecommendation from './components/StockRecommendation';
import StockGraph from './components/StockGraph';
import StockNews from './components/StockNews';
import { StockData } from './types';
import { Sun, Moon } from 'lucide-react';
import { useTranslation } from 'react-i18next';

function App() {
  const { t, i18n } = useTranslation();
  const [selectedStock, setSelectedStock] = useState<StockData | null>(null);
  const [isDarkMode, setIsDarkMode] = useState(true); // Set dark mode as default

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
  };

  const changeLanguage = (lng: string) => {
    i18n.changeLanguage(lng);
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
          <h1 className="text-4xl font-bold mb-2">{t('Stock Analyzer')}</h1>
          <p>{t('Comprehensive stock evaluation and recommendations')}</p>
          <div className="absolute top-4 right-4 flex items-center space-x-2">
            <button
              onClick={toggleDarkMode}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
            >
              {isDarkMode ? <Sun /> : <Moon />}
            </button>
            <select
              onChange={(e) => changeLanguage(e.target.value)}
              className="p-2 bg-blue-500 text-white rounded-full hover:bg-blue-600"
            >
              <option value="en">EN</option>
              <option value="es">ES</option>
              <option value="de">DE</option>
              <option value="fr">FR</option>
            </select>
          </div>
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
