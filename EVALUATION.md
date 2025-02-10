# Score Evaluation System

A comprehensive 100-point scoring system that evaluates stocks based on multiple factors to provide investment recommendations.

## Score Breakdown

### 1. Valuation (30 points)
- **P/E Ratio (15pts)** - Price-to-Earnings: Shows how much investors are willing to pay per dollar of earnings. Lower values suggest better value.
  ```
  < 15: 15pts (Undervalued)
  15-25: 12pts (Fair)
  25-35: 8pts (Slightly High)
  35-50: 4pts (High)
  > 50: 0pts (Very High)
  Negative: 3pts
  ```

- **P/S Ratio (15pts)** - Price-to-Sales: Compares stock price to revenue. Useful for companies without earnings, lower is generally better.
  ```
  < 2: 15pts (Undervalued)
  2-4: 12pts (Fair)
  4-6: 8pts (Slightly High)
  6-10: 4pts (High)
  > 10: 0pts (Very High)
  ```

### 2. Financial Health (25 points)
- **Current Ratio (12pts)** - Current Assets/Current Liabilities: Measures company's ability to pay short-term obligations.
  ```
  < 1: 3pts (Poor)
  1-1.5: 6pts (Fair)
  1.5-2: 12pts (Good)
  2-3: 9pts (Very Good)
  > 3: 6pts (Excessive)
  ```

- **Debt/Equity (13pts)** - Total Debt/Shareholders' Equity: Shows financial leverage and risk level. Lower ratios indicate less risk.
  ```
  < 0.3: 13pts (Minimal)
  0.3-0.6: 10pts (Low)
  0.6-1: 7pts (Moderate)
  1-2: 4pts (High)
  > 2: 0pts (Very High)
  ```

### 3. Market Activity (15 points)
**Trading Volume** - Daily number of shares traded: Indicates market liquidity and trading interest.
```
< 500K: 0pts (Very Low)
500K-2M: 4pts (Low)
2M-5M: 8pts (Moderate)
5M-20M: 12pts (Good)
> 20M: 15pts (High)
```

### 4. Peer Comparison (15 points)
Compares key metrics against industry averages:
- Better P/E than peers: 5pts
- Better P/S than peers: 5pts
- Better Current Ratio: 3pts
- Better Debt/Equity: 2pts

### 5. Technical Analysis (15 points)
- Trend strength: 10pts max - Measures price momentum and direction over time
- Volatility metrics: 5pts max - Evaluates price stability and risk

## Recommendations

```
80-100: Strong Buy
60-79:  Buy
40-59:  Hold
0-39:   Not Recommended
```

## Warning Signs
- Negative P/E: Company is operating at a loss
- High debt levels: Increased financial risk
- Low trading volume: Limited liquidity
- Poor peer comparison: Underperforming industry
- Negative technical trends: Unfavorable price action

*Note: This system is for analysis purposes only. Always conduct thorough research and consult financial advisors before investing.*