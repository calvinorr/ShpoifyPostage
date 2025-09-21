# Royal Mail Postage Finder

A web application for calculating Royal Mail international postage rates for yarn businesses. Built specifically for small businesses selling yarn internationally who need accurate, up-to-date Royal Mail pricing.

## Features

- 📦 **Package Calculator**: Enter dimensions and weight for accurate quotes
- 🌍 **International Destinations**: Support for Europe and World zones
- 📊 **Service Comparison**: Compare Standard, Tracked, Signed, and Tracked & Signed services
- 💰 **Real-time Pricing**: Based on Royal Mail 2025 pricing guides
- 📱 **Mobile Friendly**: Responsive design for on-the-go calculations
- 🎯 **Yarn Business Focused**: Optimized for small parcel shipping

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **UI**: Shadcn UI, TailwindCSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB (for future price monitoring)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- MongoDB connection (optional for basic functionality)

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd postage-finder
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Add your MongoDB connection string to `.env.local`:
```
MONGODB_URI=your-mongodb-connection-string
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### Basic Postage Calculation

1. **Package Details**: Enter the length, width, height (in cm) and weight (in grams)
2. **Destination**: Select the country you're shipping to
3. **Services**: Choose which Royal Mail services to compare
4. **Calculate**: Click "Calculate Postage" to see quotes

### Service Types

- **Standard**: Basic international service (no tracking)
- **Tracked**: Online tracking available
- **Signed For**: Signature required on delivery
- **Tracked & Signed**: Both tracking and signature required

### Package Size Limits

- **Small Parcel (≤2kg)**: Max 45cm × 35cm × 16cm
- **Medium Parcel (≤20kg)**: Max 61cm × 46cm × 46cm
- **Large Parcel (≤30kg)**: Max combined dimensions 150cm

## Deployment

### Deploy to Vercel

1. Install Vercel CLI:
```bash
npm i -g vercel
```

2. Deploy:
```bash
vercel
```

3. Set environment variables in Vercel dashboard:
   - `MONGODB_URI`: Your MongoDB connection string

### Environment Variables

- `MONGODB_URI`: MongoDB connection string (required for price monitoring features)

## Pricing Data

The application uses Royal Mail's 2025 pricing structure, including:

- International Standard (untracked)
- International Tracked
- International Signed For
- International Tracked & Signed

Prices are organized by:
- **Europe Zone 1**: Western Europe (France, Germany, etc.)
- **Europe Zone 2**: Eastern Europe (Poland, Czech Republic, etc.)
- **World Zone 1**: Developed countries (USA, Australia, Japan, etc.)
- **World Zone 2**: Emerging markets (China, Brazil, etc.)
- **World Zone 3**: Other destinations (Africa, etc.)

## Future Features

- [ ] Automated price monitoring from Royal Mail PDFs
- [ ] Email notifications when prices change
- [ ] Historical price tracking
- [ ] Bulk shipping calculator
- [ ] Saved shipping scenarios
- [ ] UK domestic pricing
- [ ] Currency conversion

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/new-feature`)
3. Commit changes (`git commit -am 'Add new feature'`)
4. Push to branch (`git push origin feature/new-feature`)
5. Create a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Disclaimer

This application provides pricing estimates based on Royal Mail's official 2025 pricing guides. Prices may change without notice. Always verify pricing with Royal Mail for official quotes. Additional customs fees may apply for international shipments.

## Support

For support or questions, please open an issue on GitHub.

---

Built with ❤️ for yarn businesses
