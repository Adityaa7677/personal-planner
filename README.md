# ChronoPaper — Personal Planner Web App

A calm, editorial, personal daily planner web app built like high-grade paper stationery rather than a SaaS dashboard.

## Tech Stack
- **Framework**: React 19 + TypeScript + Vite
- **Styling**: Tailwind CSS v4 + Custom Design Tokens (`src/styles/tokens.css`)
- **State Management**: Zustand with persistent storage abstraction (`src/core/storage.ts`)
- **Testing**: Vitest (`src/core/__tests__/actions.test.ts`)
- **Icons**: Lucide React (thin-stroke 1.5)

## Design Principles
- **Aesthetic**: Warm paper (`#F6F3EE`), archival near-black ink (`#1B1A17`), and full dark mode (`#141311`).
- **Typography**: Editorial serif (`Fraunces`) for titles & big numbers, clean sans (`Inter`) for UI, tabular numerals for all time measurements.
- **Accents**: Single amber/terracotta bookmark ribbon (`#B45309`), muted desaturated goal badges.
- **Rules**: 1px hairline borders, 8px spacing grid, 150–220ms ease-out transitions, strictly no bounce.

## Core Features & AI Actions (`src/core/actions.ts`)
- `addGoal`, `updateGoal`, `deleteGoal`
- `addSubtask`, `toggleSubtask`
- `addBlock`, `updateBlock`, `deleteBlock`
- `getBlocksForDate(date)`: Supports one-off and recurring blocks (e.g. college Mon–Fri).
- `getFreeWindows(date)`: Calculates unallocated time gaps between blocks.
- `getNowSuggestion(now)`: Identifies active blocks or suggests the nearest-deadline unfinished subtask fitting the current free window.

## Development
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Build production bundle
npm run build
```
