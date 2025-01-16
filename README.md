Collecting workspace information

# Stock Analyzer

A React-based stock analysis tool that provides technical indicators and investment recommendations based on fundamental analysis.

## Features

- Real-time stock data fetching using Financial Modeling Prep API
- Company search functionality
- Interactive price charts with multiple timeframes (1W, 1M, 3M, 1Y)
- Fundamental analysis including:
  - P/E Ratio
  - P/S Ratio
  - Trading Volume
  - Current Ratio
  - Debt to Equity
  - Market Cap
- Automated investment recommendations based on multiple metrics
- Responsive design with Tailwind CSS

## Work in Progress

This project is currently under development. Future features may include:
- Additional technical indicators
- Portfolio tracking
- Price alerts
- More detailed fundamental analysis
- Enhanced visualization options

## Setup

1. Clone the repository
2. Install dependencies:
```sh
npm install
```
3. Create a 

.env

 file with your API keys:
```sh
VITE_FMP_API_KEY=your_api_key_here
```
4. Run the development server:
```sh
npm run dev
```

## Disclaimer

This tool is for educational and informational purposes only. The investment recommendations and analysis provided should not be considered as financial advice. Always conduct your own research and consult with a qualified financial advisor before making any investment decisions. The creator of this tool cannot be held liable for any financial losses incurred based on investment decisions made using this application.

## Technologies Used

- React
- TypeScript
- Vite
- Chart.js
- Tailwind CSS
- Financial Modeling Prep API

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE) file for details.

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.

This program is distributed in the hope that it will be useful, but WITHOUT ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU General Public License for more details.