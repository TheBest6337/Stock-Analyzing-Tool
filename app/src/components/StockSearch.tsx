import { useState } from 'react';
import { getStockData, searchCompanies, getHistoricalData } from '../services/stockApi';
import { StockData } from '../types';

interface Props {
  onStockSelect: (stock: StockData | null) => void;
}

export default function StockSearch({ onStockSelect }: Props) {
  const [query, setQuery] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ symbol: string; name: string }>>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSearch = async () => {
    if (!query) return;
    
    setLoading(true);
    setError('');
    try {
      const results = await searchCompanies(query);
      setSearchResults(results);
    } catch (err: any) {
      setError(err.message);
      setSearchResults([]);
    }
    setLoading(false);
  };

  const handleSelectStock = async (symbol: string) => {
    setLoading(true);
    setError('');
    try {
      const [stockData, historicalData] = await Promise.all([
        getStockData(symbol),
        getHistoricalData(symbol)
      ]);
      
      onStockSelect({
        ...stockData,
        historicalData: historicalData.map(d => ({
          date: d.date,
          price: d.closePrice
        }))
      });
      setSearchResults([]);
      setQuery('');
    } catch (err: any) {
      setError(err.message);
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
          className="flex-1 p-2 border rounded"
        />
        <button
          onClick={handleSearch}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:bg-blue-300"
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </div>

      {error && (
        <div className="mt-2 text-red-500">{error}</div>
      )}

      {searchResults.length > 0 && (
        <div className="mt-2 border rounded divide-y">
          {searchResults.map((result) => (
            <button
              key={result.symbol}
              onClick={() => handleSelectStock(result.symbol)}
              className="w-full p-2 text-left hover:bg-gray-100"
            >
              <span className="font-medium">{result.symbol}</span> - {result.name}
            </button>
          ))}
        </div>
      )}
      {loading && <div className="mt-4 text-center">Loading stock data...</div>}
    </div>
  );
}
