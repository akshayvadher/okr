# OKR App

A Next.js application for managing Objectives and Key Results (OKRs) with a clean, Linear-inspired UI.

## Features

- View and manage objectives and key results
- Create new objectives with title, description, and date range
- Add key results to objectives with target values
- Update progress on key results
- Visual status indicators for objectives (on-track, at-risk, behind)
- Dashboard with status distribution and progress visualization
- Responsive design optimized for desktop and mobile

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **State Management**: TanStack Query (React Query)
- **UI Components**: Custom components with Radix UI primitives
- **Data Visualization**: Recharts
- **Forms**: React Hook Form
- **TypeScript**: For type safety

## Getting Started

1. Clone the repository
2. Install dependencies:

```bash
npm install
# or
yarn install
# or
pnpm install
```

3. Create a `.env.local` file with your API endpoint:

```
NEXT_PUBLIC_API_URL=http://your-backend-api-url/api/v1
```

4. Run the development server:

```bash
bun dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## API Integration

The app integrates with a RESTful API with the following endpoints:

- `GET /api/v1/objectives` - List all objectives
- `GET /api/v1/objectives/:id` - Get a specific objective
- `GET /api/v1/objectives/:id/details` - Get objective details with key results
- `POST /api/v1/objectives` - Create a new objective
- `POST /api/v1/objectives/:id/key-results` - Add a key result to an objective
- `PATCH /api/v1/key-results/:id/progress` - Update key result progress

## Project Structure

- `src/app` - Next.js App Router pages
- `src/components` - UI components
    - `ui` - Base UI components
    - `objectives` - Objective-related components
    - `key-results` - Key result components
    - `dashboard` - Dashboard and visualization components
- `src/hooks` - Custom React hooks for data fetching
- `src/lib` - Utility functions and API client
- `src/types` - TypeScript type definitions

## Screenshots

[Add screenshots of your application here]

## License

MIT
