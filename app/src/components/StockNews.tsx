import React, { useState, useEffect } from 'react';
import { getStockNews } from '../services/stockApi';
import { NewsArticle } from '../types';
import toast from 'react-hot-toast';
import { useTranslation } from 'react-i18next';

interface StockNewsProps {
  symbol: string;
}

const StockNews: React.FC<StockNewsProps> = ({ symbol }) => {
  const { t } = useTranslation();
  const [news, setNews] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showAll, setShowAll] = useState(false);

  useEffect(() => {
    const fetchNews = async () => {
      const loadingToast = toast.loading(t('Loading news...'));
      try {
        const newsData = await getStockNews(symbol);
        setNews(newsData);
        toast.success(t('News loaded successfully'), { id: loadingToast });
      } catch (err: any) {
        toast.error(err.message || t('Failed to load news'), { id: loadingToast });
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchNews();
  }, [symbol, t]);

  if (loading) {
    return <div>{t('Loading news...')}</div>;
  }

  if (error) {
    return <div>{t('Error fetching news')}: {error}</div>;
  }

  const displayedNews = showAll ? news : news.slice(0, 4);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-semibold mb-4">{t('Latest News')}</h2>
      <ul className="space-y-4">
        {displayedNews.map((article, index) => (
          <li key={index} className="border-b pb-4">
            <a href={article.url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">
              <h3 className="text-lg font-medium">{article.title}</h3>
            </a>
            <p className="text-gray-600 dark:text-gray-300">{article.description}</p>
            <p className="text-sm text-gray-500 dark:text-gray-400">{new Date(article.publishedAt).toLocaleString()}</p>
          </li>
        ))}
      </ul>
      {news.length > 4 && (
        <button
          onClick={() => setShowAll(!showAll)}
          className="mt-4 text-blue-500 hover:underline"
        >
          {showAll ? t('Show less') : t('See more')}
        </button>
      )}
    </div>
  );
};

export default StockNews;
