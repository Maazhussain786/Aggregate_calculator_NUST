# NUST Aggregate Calculator & Merit Predictor

A comprehensive web application for NUST (National University of Sciences and Technology) aspirants in Pakistan. Calculate your aggregate, explore historical merit data, and predict your admission chances.

![NUST Aggregate Calculator](https://via.placeholder.com/800x400?text=NUST+Aggregate+Calculator)

## Features

- **🧮 Aggregate Calculator** - Calculate NUST aggregate using the official formula (NET 75%, FSc 15%, Matric 10%)
- **📊 Merit History** - Explore historical closing merits and positions for all programs
- **🎯 Admission Predictor** - Get AI-powered predictions for your admission chances
- **📋 Preference Generator** - Generate optimized preference lists based on your chances
- **📈 Trend Charts** - Visualize merit trends across years
- **🔍 SEO Optimized** - Built with SEO best practices for discoverability

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: SQLite (dev) / PostgreSQL (prod) via Prisma ORM
- **Charts**: Chart.js with react-chartjs-2
- **Deployment**: Vercel-ready

## Getting Started

### Prerequisites

- Node.js 18+ (recommended: 20+)
- npm or yarn
- PostgreSQL (for production) or SQLite (for development)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Aggregate_project
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root directory:
   ```env
   # Database - SQLite for development
   DATABASE_URL="file:./dev.db"
   
   # For PostgreSQL (production):
   # DATABASE_URL="postgresql://user:password@localhost:5432/nust_aggregate?schema=public"
   
   # Site URL
   NEXT_PUBLIC_SITE_URL="http://localhost:3000"
   ```

4. **Initialize the database**
   ```bash
   # Generate Prisma client
   npm run db:generate
   
   # Push schema to database
   npm run db:push
   
   # Seed with sample data
   npm run db:seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Project Structure

```
├── prisma/
│   ├── schema.prisma      # Database schema
│   └── seed.ts            # Seed script
├── scripts/
│   └── importMeritData.ts # Data import utility
├── src/
│   ├── app/               # Next.js App Router pages
│   │   ├── page.tsx       # Home page
│   │   ├── aggregate-calculator/
│   │   ├── merit-history/
│   │   ├── admission-predictor/
│   │   ├── preference-generator/
│   │   ├── about/
│   │   ├── contact/
│   │   ├── blog/
│   │   └── api/           # API routes
│   ├── components/        # React components
│   │   ├── charts/
│   │   ├── forms/
│   │   ├── layout/
│   │   └── results/
│   ├── lib/               # Core logic
│   │   ├── calcAggregate.ts
│   │   ├── chancePredictor.ts
│   │   ├── meritListPredictor.ts
│   │   ├── netScoreRecommender.ts
│   │   ├── preferenceGenerator.ts
│   │   └── db.ts
│   └── data/
│       └── sampleMeritData.json
├── public/                # Static assets
├── package.json
├── tsconfig.json
└── README.md
```

## Database Schema

### Programs
| Field | Type | Description |
|-------|------|-------------|
| id | String | Primary key |
| name | String | Program name (e.g., "BS Computer Science") |
| code | String | Unique code (e.g., "SEECS-CS") |
| campus | String | Campus location |
| school | String | School name (e.g., "SEECS") |
| disciplineGroup | String | Discipline category |
| degreeType | String | Degree type (BS, BE, BBA, etc.) |
| seats | Int? | Number of seats |

### MeritHistory
| Field | Type | Description |
|-------|------|-------------|
| programId | String | Foreign key to Program |
| year | Int | Admission year |
| meritListNumber | Int? | Merit list number (1-8) |
| closingMeritPosition | Int? | Last admitted position |
| closingAggregate | Float? | Closing aggregate percentage |
| sourceName | String | Data source |

## Importing Your Own Data

### Via JSON
1. Create a JSON file following the structure in `src/data/sampleMeritData.json`
2. Run the import script:
   ```bash
   npx ts-node scripts/importMeritData.ts path/to/your-data.json
   ```

### Via CSV
1. Create a CSV with headers: `programCode,year,meritListNumber,closingAggregate,closingMeritPosition,sourceName`
2. Run:
   ```bash
   npx ts-node scripts/importMeritData.ts path/to/your-data.csv
   ```

### Dry Run
Preview changes without saving:
```bash
npx ts-node scripts/importMeritData.ts path/to/data.json --dry-run
```

## Customizing Prediction Logic

The prediction rules can be adjusted by modifying constants in the following files:

### Chance Predictor (`src/lib/chancePredictor.ts`)
```typescript
export const PREDICTION_CONFIG = {
  THRESHOLDS: {
    HIGH_ABOVE: 2,    // +2% above closing = High chance
    MEDIUM_BELOW: -1, // Up to 1% below = Medium chance
    LOW_BELOW: -3,    // More than 3% below = Low chance
  },
  // ...
};
```

### Merit List Predictor (`src/lib/meritListPredictor.ts`)
```typescript
export const MERIT_LIST_CONFIG = {
  MAX_LISTS: 8,
  DEFAULT_AGGREGATE_DROP_PER_LIST: 1.5,
  // ...
};
```

## Available Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run db:generate` | Generate Prisma client |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run database migrations |
| `npm run db:seed` | Seed database with sample data |
| `npm run db:studio` | Open Prisma Studio |

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Import project in Vercel
3. Set environment variables:
   - `DATABASE_URL`: Your PostgreSQL connection string
   - `NEXT_PUBLIC_SITE_URL`: Your production URL
4. Deploy!

### Other Platforms

The app can be deployed to any platform supporting Node.js:
- Railway
- Render
- DigitalOcean App Platform
- AWS (Amplify, ECS, etc.)

## API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/programs` | GET | List all programs |
| `/api/merit-history` | GET | Get merit history data |
| `/api/calculate-aggregate` | POST | Calculate aggregate |
| `/api/predict` | POST | Get admission prediction |
| `/api/contact` | POST | Submit contact form |

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Disclaimer

This is an **unofficial** tool. It is not affiliated with, endorsed by, or officially connected to NUST. All predictions are estimates based on historical data and should be used for informational purposes only. Always verify information with official NUST sources.

## License

MIT License - see LICENSE file for details.

---

Built with ❤️ for NUST aspirants
