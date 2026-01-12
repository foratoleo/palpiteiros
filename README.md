# Palpiteiros v2

A modern prediction markets interface built with Next.js 15, React 18, and Polymarket's Gamma API. Features real-time market data, portfolio management, price alerts, and an Apple-inspired glassmorphism design.

## Tech Stack

### Core Framework
- **Next.js 15** - React framework with App Router
- **React 18.3** - UI library
- **TypeScript 5** - Type safety
- **TailwindCSS 3** - Utility-first styling

### Data & State
- **TanStack Query v5** - Server state management
- **Zustand** - Client state management
- **Supabase** - Database and real-time subscriptions

### UI & Animation
- **Radix UI** - Accessible component primitives
- **Framer Motion** - Animation library
- **Recharts** - Chart components
- **Lucide React** - Icon library

### Testing
- **Vitest** - Unit testing framework
- **Playwright** - E2E testing framework
- **Testing Library** - Component testing utilities

## Project Structure

```
palpiteiros-v2/
├── src/
│   ├── app/                 # Next.js App Router pages
│   │   ├── (main)/         # Main application routes
│   │   │   ├── markets/   # Markets list and detail pages
│   │   │   ├── portfolio/ # Portfolio management
│   │   │   ├── alerts/    # Price alerts
│   │   │   └── settings/  # User settings
│   │   ├── layout.tsx     # Root layout
│   │   └── providers.tsx  # App providers
│   ├── components/         # React components
│   │   ├── ui/            # Base UI components (Shadcn/UI)
│   │   ├── market/        # Market-related components
│   │   ├── portfolio/     # Portfolio components
│   │   ├── alerts/        # Alert components
│   │   ├── charts/        # Chart components
│   │   ├── search/        # Search and filter components
│   │   ├── effects/       # Animation effects
│   │   ├── errors/        # Error handling components
│   │   └── layout/        # Layout components
│   ├── hooks/             # Custom React hooks
│   ├── stores/            # Zustand stores
│   ├── services/          # API services (Gamma, Supabase)
│   ├── types/             # TypeScript type definitions
│   └── lib/               # Utility functions
├── e2e/                   # Playwright E2E tests
├── docs/                  # Documentation
└── public/                # Static assets
```

## Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn/pnpm
- Supabase account (for database)
- Polymarket Gamma API access

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd palpiteiros-v2
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.example .env.local
```

Edit `.env.local` and add your credentials:
```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Gamma API
NEXT_PUBLIC_GAMMA_API_URL=https://gamma-api.polymarket.com
```

4. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm run type-check` | Run TypeScript type checking |
| `npm run test` | Run Vitest unit tests |
| `npm run test:ui` | Run Vitest with UI |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run test:e2e` | Run Playwright E2E tests |
| `npm run test:e2e:ui` | Run E2E tests with UI |

## Architecture

### Data Flow

1. **Gamma API** - Fetches market data from Polymarket
2. **Supabase** - Stores user data, portfolios, and alerts
3. **TanStack Query** - Caches and manages server state
4. **Zustand Stores** - Manages client-side state

### Component Patterns

- **Server Components** - Used for static content and initial data
- **Client Components** - Used for interactive features
- **Compound Components** - Used for complex UI (Dialog, Dropdown, etc.)
- **Higher-Order Components** - Used for cross-cutting concerns

### State Management Strategy

| State Type | Solution | Example |
|------------|----------|---------|
| Server State | TanStack Query | Market data, portfolios |
| Client State | Zustand | Filters, UI preferences |
| Form State | React Hook Form | Alert creation |
| URL State | Next.js searchParams | Search, pagination |

## Key Features

### Markets
- Browse prediction markets from Polymarket
- Real-time price updates via Supabase subscriptions
- Advanced filtering and sorting
- Multiple view modes (grid, list, compact)

### Portfolio
- Track open positions
- Real-time P&L calculations
- Allocation charts
- Performance analytics

### Alerts
- Set price alerts on any market
- Multiple condition types (above, below, cross)
- Push notification support
- Alert history and management

### Design System
- Apple-inspired glassmorphism
- Smooth animations and transitions
- Dark/light mode support
- Responsive across all devices

## Testing

### Unit Tests

Unit tests are located in `src/**/__tests__/` directories:

```bash
# Run all unit tests
npm run test

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

### E2E Tests

E2E tests are located in the `e2e/` directory:

```bash
# Run E2E tests
npm run test:e2e

# Run with UI
npm run test:e2e:ui

# Run on specific browsers
npx playwright test --project=chromium
```

## Contributing

Please read our [Contributing Guide](CONTRIBUTING.md) for details on our code of conduct and development process.

## License

This project is licensed under the MIT License.

## Acknowledgments

- [Polymarket](https://polymarket.com) - For the prediction markets platform
- [Gamma API](https://docs.polymarket.com) - For the market data API
- [Shadcn/UI](https://ui.shadcn.com) - For the component architecture
- [Vercel](https://vercel.com) - For the Next.js framework
