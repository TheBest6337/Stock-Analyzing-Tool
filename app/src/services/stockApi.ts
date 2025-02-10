import { NewsArticle } from '../types';

const API_KEY = import.meta.env.VITE_FMP_API_KEY;
const BASE_URL = 'https://financialmodelingprep.com/api/v3';
const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const NEWS_API_URL = 'https://newsapi.org/v2/everything';
import peersData from '../data/peers.json';

// Helper function to handle API errors
const handleApiError = (error: any, context: string) => {
  if (error.response) {
    // The request was made and the server responded with a status code
    // that falls out of the range of 2xx
    if (error.response.status === 401 || error.response.status === 403) {
      throw new Error('API key invalid or expired');
    } else if (error.response.status === 429) {
      throw new Error('API rate limit exceeded. Please try again later.');
    }
  } else if (error.request) {
    // The request was made but no response was received
    throw new Error('Network error. Please check your internet connection.');
  }
  // Default error message
  throw new Error(`${context}: ${error.message || 'An unknown error occurred'}`);
};

export async function getStockData(symbol: string) {
  try {
    if (!API_KEY) {
      throw new Error('API key is not configured');
    }

    const [quoteRes, metricsRes, peerMetrics] = await Promise.all([
      fetch(`${BASE_URL}/quote/${symbol}?apikey=${API_KEY}`),
      fetch(`${BASE_URL}/key-metrics-ttm/${symbol}?apikey=${API_KEY}`),
      getPeerMetrics(symbol)
    ]);

    if (!quoteRes.ok || !metricsRes.ok) {
      const errorStatus = !quoteRes.ok ? quoteRes.status : metricsRes.status;
      if (errorStatus === 429) {
        throw new Error('API rate limit exceeded. Please try again later.');
      }
      throw new Error('Failed to fetch stock data');
    }

    const [quoteData, metricsData] = await Promise.all([
      quoteRes.json(),
      metricsRes.json()
    ]);

    const quote = quoteData?.[0];
    const metrics = metricsData?.[0];

    if (!quote?.symbol) {
      throw new Error(`No data found for symbol: ${symbol}`);
    }

    return {
      symbol,
      name: quote.name || symbol,
      metrics: {
        pe: quote.pe || 0,
        ps: Number((metrics?.priceToSalesRatioTTM || 0).toFixed(2)),
        volume: quote.volume || 0,
        marketCap: quote.marketCap || 0,
        priceToBook: metrics?.pbRatioTTM || 0,
        debtToEquity: metrics?.debtToEquityTTM || 0,
        currentRatio: metrics?.currentRatioTTM || 0
      },
      fundamentals: {
        sharesOutstanding: quote.sharesOutstanding || 0,
        earningsPerShare: quote.eps || 0,
        dividendYield: quote.dividendYield || 0,
        profitMargin: metrics?.netProfitMarginTTM || 0,
        returnOnEquity: metrics?.roeTTM || 0
      },
      peerMetrics
    };
  } catch (error: any) {
    handleApiError(error, 'Failed to fetch stock data');
  }
}

export async function getPeerMetrics(symbol: string) {
  return getStaticPeerMetrics(symbol);
}

function getStaticPeerMetrics(symbol: string) {
  const sector = getSectorBySymbol(symbol);
  const peers = peersData[sector] || [];

  // Mock peer metrics for static peers
  return peers.map((peerSymbol: string) => ({
    symbol: peerSymbol,
    pe: Math.random() * 30,
    ps: Math.random() * 10,
    volume: Math.random() * 100000000,
    currentRatio: Math.random() * 2,
    debtToEquity: Math.random() * 2
  }));
}

function getSectorBySymbol(symbol: string) {
  // Mock function to determine sector by symbol
  // In a real application, this should be replaced with actual logic
  if (peersData.Tech.includes(symbol)) return 'Tech';
  if (peersData.Health.includes(symbol)) return 'Health';
  if (peersData.Oil.includes(symbol)) return 'Oil';
  if (peersData.Financials.includes(symbol)) return 'Financials';
  if (peersData['Consumer Discretionary'].includes(symbol)) return 'Consumer Discretionary';
  if (peersData['Consumer Staples'].includes(symbol)) return 'Consumer Staples';
  if (peersData.Energy.includes(symbol)) return 'Energy';
  if (peersData.Industrial.includes(symbol)) return 'Industrial';
  if (peersData.Utilities.includes(symbol)) return 'Utilities';
  if (peersData.Materials.includes(symbol)) return 'Materials';
  return 'Tech'; // Default to Tech if not found
}

export async function searchCompanies(query: string) {
  try {
    const response = await fetch(
      `${BASE_URL}/search?query=${encodeURIComponent(query)}&limit=10&apikey=${API_KEY}`
    );

    if (!response.ok) {
      throw new Error('API request failed');
    }

    const data = await response.json();
    return data.map((item: any) => ({
      symbol: item.symbol,
      name: item.name,
      exchangeShortName: item.exchangeShortName
    }));
  } catch (error: any) {
    console.error('Search API Error:', error);
    throw new Error(`Failed to search companies: ${error.message || 'Unknown error'}`);
  }
}

export async function getHistoricalData(symbol: string): Promise<{ date: string; closePrice: number; }[]> {
  try {
    if (!API_KEY) {
      throw new Error('API key is not configured');
    }

    const response = await fetch(
      `${BASE_URL}/historical-price-full/${symbol}?apikey=${API_KEY}&timeseries=365`
    );

    if (!response.ok) {
      if (response.status === 429) {
        throw new Error('API rate limit exceeded. Please try again later.');
      }
      throw new Error('Failed to fetch historical data');
    }

    const data = await response.json();
    
    if (!data.historical || !Array.isArray(data.historical)) {
      throw new Error('Invalid historical data format');
    }

    return data.historical
      .slice(0, 365)
      .map((item: any) => ({
        date: item.date,
        closePrice: item.close
      }))
      .reverse();
  } catch (error) {
    handleApiError(error, 'Failed to fetch historical data');
    return [];
  }
}

export async function getStockNews(symbol: string): Promise<NewsArticle[]> {
  try {
    if (!NEWS_API_KEY) {
      throw new Error('News API key is not configured');
    }

    const response = await fetch(
      `${NEWS_API_URL}?q=${symbol}&apiKey=${NEWS_API_KEY}`
    );

    if (!response.ok) {
      if (response.status === 403) {
        throw new Error('News API key is invalid or expired');
      }
      if (response.status === 429) {
        throw new Error('News API rate limit exceeded. Please try again later.');
      }
      throw new Error('Failed to fetch stock news');
    }

    const data = await response.json();

    if (!Array.isArray(data.articles)) {
      throw new Error('Invalid news data format');
    }

    return data.articles.map((item: any) => ({
      title: item.title || 'No title available',
      description: item.description || 'No description available',
      url: item.url,
      publishedAt: item.publishedAt
    }));
  } catch (error) {
    handleApiError(error, 'Failed to fetch stock news');
    return [];
  }
}
