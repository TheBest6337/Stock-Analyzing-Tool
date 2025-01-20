export interface HistoricalDataPoint {
  date: string;
  price: number;
}

export interface StockData {
  symbol: string;
  name: string;
  metrics: {
    pe: number;
    ps: number;
    volume: number;
    marketCap: number;
    priceToBook: number;
    debtToEquity: number;
    currentRatio: number;
  };
  fundamentals: {
    sharesOutstanding: number;
    earningsPerShare: number;
    dividendYield: number;
    profitMargin: number;
    returnOnEquity: number;
  };
  historicalData: HistoricalDataPoint[];
}

export type TimeRange = '1D' | '1W' | '1M' | '3M' | '1Y';

export interface NewsArticle {
  title: string;
  description: string;
  url: string;
  publishedAt: string;
}
