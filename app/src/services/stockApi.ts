const API_KEY = import.meta.env.VITE_FMP_API_KEY;
const BASE_URL = 'https://financialmodelingprep.com/api/v3';
const NEWS_API_KEY = import.meta.env.VITE_NEWS_API_KEY;
const NEWS_API_URL = 'https://newsapi.org/v2/everything';

export async function getStockData(symbol: string) {
  try {
    console.log('Fetching data for symbol:', symbol);

    const [quoteRes, metricsRes] = await Promise.all([
      fetch(`${BASE_URL}/quote/${symbol}?apikey=${API_KEY}`),
      fetch(`${BASE_URL}/key-metrics-ttm/${symbol}?apikey=${API_KEY}`)
    ]);

    if (!quoteRes.ok || !metricsRes.ok) {
      throw new Error('API request failed');
    }

    const [quoteData, metricsData] = await Promise.all([
      quoteRes.json(),
      metricsRes.json()
    ]);

    const quote = quoteData?.[0] || {};
    const metrics = metricsData?.[0] || {};

    if (!quote.symbol) {
      throw new Error(`No data found for symbol: ${symbol}`);
    }

    return {
      symbol,
      name: quote.name || symbol,
      metrics: {
        pe: quote.pe || 0,
        ps: Number((metrics.priceToSalesRatioTTM || 0).toFixed(2)),
        volume: quote.volume || 0,
        marketCap: quote.marketCap || 0,
        priceToBook: metrics.pbRatioTTM || 0,
        debtToEquity: metrics.debtToEquityTTM || 0,
        currentRatio: metrics.currentRatioTTM || 0
      },
      fundamentals: {
        sharesOutstanding: quote.sharesOutstanding || 0,
        earningsPerShare: quote.eps || 0,
        dividendYield: quote.dividendYield || 0,
        profitMargin: metrics.netProfitMarginTTM || 0,
        returnOnEquity: metrics.roeTTM || 0
      }
    };
  } catch (error: any) {
    console.error('API Error:', error);
    throw new Error(`Failed to fetch stock data: ${error.message || 'Unknown error'}`);
  }
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
    const response = await fetch(
      `${BASE_URL}/historical-price-full/${symbol}?apikey=${API_KEY}&timeseries=365`
    );

    if (!response.ok) {
      throw new Error('Failed to fetch historical data');
    }

    const data = await response.json();
    
    if (!data.historical || !Array.isArray(data.historical)) {
      throw new Error('Invalid historical data format');
    }

    return data.historical
      .slice(0, 365) // Get a full year of data
      .map((item: any) => ({
        date: item.date,
        closePrice: item.close
      }))
      .reverse();
  } catch (error) {
    console.error('Error fetching historical data:', error);
    throw error;
  }
}

export async function getStockNews(symbol: string): Promise<NewsArticle[]> {
  try {
    const response = await fetch(
      `${NEWS_API_URL}?q=${symbol}&apiKey=${NEWS_API_KEY}`
    );

    if (response.status === 403) {
      console.error('Error fetching stock news: Access forbidden (403)');
      throw new Error('Failed to fetch stock news: Access forbidden');
    }

    if (!response.ok) {
      throw new Error('Failed to fetch stock news');
    }

    const data = await response.json();

    if (!Array.isArray(data.articles)) {
      throw new Error('Invalid news data format');
    }

    return data.articles.map((item: any) => ({
      title: item.title,
      description: item.description,
      url: item.url,
      publishedAt: item.publishedAt
    }));
  } catch (error) {
    console.error('Error fetching stock news:', error);
    throw error;
  }
}
