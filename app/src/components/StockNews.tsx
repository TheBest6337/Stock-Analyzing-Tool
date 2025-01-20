import React, { useState, useEffect } from 'react';
import { getStockNews } from '../services/stockApi';
import { NewsArticle } from '../types';

interface StockNewsProps {
  symbol: string;
}

const StockNews: React.FC<StockNewsProps> = ({ symbol }) => {
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const newsData = await getStockNews(symbol);
        setNews(newsData);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [symbol]);

  if (loading) {
    return <div>Loading news...</div>;
  }

  if (error) {
    return <div>Error fetching news: {error}</div>;
  }

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">Latest News</h2>
      <ul className="space-y-4">
        {news.map((article, index) => (
          <li key={index} className="border-b pb-4">
            <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              <h3 className="text-lg font-medium">{article.title}</h3>
            </a>
            <p className="text-gray-600 dark:text-gray-300">{article.description}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(article.publishedAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default StockNews;
