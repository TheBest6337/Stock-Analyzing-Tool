# Stock Analyzer (WIP)

A React-based stock analysis tool that provides technical indicators and investment recommendations based on fundamental analysis.

![image](https://github.com/user-attachments/assets/5cdaac7f-1e95-49f2-b7a1-9fa69de71abc)
![image](https://github.com/user-attachments/assets/d6311ed4-130d-43c0-9b51-9b8d5b761f43)


## Features

- Stock data fetching using Financial Modeling Prep API
- Company search functionality
- Interactive price charts with multiple timeframes (1W, 1M, 3M, 1Y)
- Fundamental analysis including:
  - P/E Ratio
  - P/S Ratio
  - Trading Volume
- Automated investment recommendations based on multiple metrics ([See evaluation criteria](EVALUATION.md))
- Responsive design with Tailwind CSS

## Work in Progress

This project is currently under development. Future features may include:
- Additional technical indicators
- More detailed fundamental analysis which compares different stocks
- Enhanced visualization options

### Roadmap

- [x] Better score evaluation
- [ ] Compare with other stocks
- [x] News information
- [ ] Multi-language support
- [x] Dark mode

## Prerequisites

Before you begin, ensure you have the following installed on your system:
- Node.js (version 16.0 or higher)
- npm (Node Package Manager, usually comes with Node.js)

You can check if you have these installed by running:
```sh
node --version
npm --version
```

If you need to install these tools:
- Node.js & npm: Download from [nodejs.org](https://nodejs.org/)

## Setup

1. Clone the repository
2. Change into the application directory:
```sh
cd app
```
3. Install dependencies:
```sh
npm install
```
4. Create a ```.env``` file in the ```app``` directory with your API key that you can get for free from [Financial Modeling Prep](https://site.financialmodelingprep.com/):
```sh
VITE_FMP_API_KEY=your_api_key_here
```
5. if you want to see the latest news, obtain your API key from [News API](https://newsapi.org/) and add the following line to the `.env` file:
```sh
VITE_NEWS_API_KEY=your_news_api_key_here
```
7. Ensure that the `.gitignore` file includes `.env` to prevent the API key from being committed to the repository.
8. Run the development server:
```sh
npm run dev
```

## Disclaimer

This tool is for educational and informational purposes only. The investment recommendations and analysis provided should not be considered as financial advice. Always conduct your own research and consult with a qualified financial advisor before making any investment decisions. The creator of this tool cannot be held liable for any financial losses incurred based on investment decisions made using this application.

## Contributing

Contributions are welcome! Here's how you can help:

1. Fork the repository
2. Create a new branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Commit your changes (`git commit -m 'Add some amazing feature'`)
5. Push to the branch (`git push origin feature/amazing-feature`)
6. Open a Pull Request

## License

This project is licensed under the GNU General Public License v3.0 - see the [LICENSE](LICENSE.txt) file for details.

This program is free software: you can redistribute it and/or modify it under the terms of the GNU General Public License as published by the Free Software Foundation, either version 3 of the License, or (at your option) any later version.
