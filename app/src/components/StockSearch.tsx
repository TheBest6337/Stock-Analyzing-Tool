import { useState } from 'react';
import { getStockData, searchCompanies, getHistoricalData } from '../services/stockApi';
import { StockData } from '../types';
import ClipLoader from 'react-spinners/ClipLoader';
import toast from 'react-hot-toast';

interface Props {
  onStockSelect: (stock: StockData | null) => void;
}

export default function StockSearch({ onStockSelect }: Props) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ symbol: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query) {
      toast.error('Please enter a search query');
      return;
    }
    
    setLoading(true);
    try {
      const results = await searchCompanies(query);
      if (results.length === 0) {
        toast.error('No companies found matching your search');
      }
      setSearchResults(results);
    } catch (err: any) {
      toast.error(err.message || 'Failed to search companies');
      setSearchResults([]);
    }
    setLoading(false);
  };

  const handleSelectStock = async (symbol: string) => {
    setLoading(true);
    const loadingToast = toast.loading(`Loading data for ${symbol}...`);
    try {
      const [stockData, historicalData] = await Promise.all([
        getStockData(symbol),
        getHistoricalData(symbol)
      ]);
      
      if (!stockData) {
        throw new Error('Failed to fetch stock data');
      }

      onStockSelect({
        ...stockData,
        historicalData: historicalData.map(d => ({
          date: d.date,
          price: d.closePrice
        }))
      });
      setSearchResults([]);
      setQuery('');
      toast.success(`Successfully loaded ${symbol} data`, {
        id: loadingToast
      });
    } catch (err: any) {
      toast.error(err.message || `Failed to load ${symbol} data`, {
        id: loadingToast
      });
      onStockSelect(null);
    }
    setLoading(false);
  };

  return (
    <div className="max-w-xl mx-auto">
      <div className="flex gap-2">
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search by company name or symbol..."
          className="flex-1 p-2 border rounded bg-white dark:bg-gray-800 text-black dark:text-white"
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              handleSearch();
            }
          }}
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {searchResults.length > 0 && (
        <div className="mt-2 border rounded divide-y">
          {searchResults.map((result) => (
            <button
              key={result.symbol}
              onClick={() => handleSelectStock(result.symbol)}
              className="w-full p-2 text-left hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              <span className="font-medium">{result.symbol}</span> - {result.name}
            </button>
          ))}
        </div>
      )}
      {loading && <div className="mt-4 text-center"><ClipLoader color="#0000ff" loading={loading} size={35} /></div>}
    </div>
  );
}
