# Stock Analyzer (WIP)

A React-based stock analysis tool that provides technical indicators and investment recommendations based on fundamental analysis.

![Screenshot 2025-01-16 115708](https://github.com/user-attachments/assets/39ad0c78-fe3f-42c8-9cfb-16985d4cb4f5)

## Features

- Stock data fetching using Financial Modeling Prep API
- Company search functionality
- Interactive price charts with multiple timeframes (1W, 1M, 3M, 1Y)
- Fundamental analysis including:
  - P/E Ratio
  - P/S Ratio
  - Trading Volume
- Automated investment recommendations based on multiple metrics
- Responsive design with Tailwind CSS

## Work in Progress

This project is currently under development. Future features may include:
- Additional technical indicators
- More detailed fundamental analysis which compares different stocks
- Enhanced visualization options

### Roadmap

- [ ] Better score evaluation
- [ ] Compare with other stocks
- [ ] News information
- [ ] Multi-lanuage support
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
5. Run the development server:
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
