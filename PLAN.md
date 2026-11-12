# ChronoPaper — Personal Planner Web App

> **Golden Rule**: Read `PLAN.md` and `DESIGN.md` before every task, update `PLAN.md` after every task.

---

## 1. Project Goal
Build a calm, editorial, personal paper-like planner web app that operates without the visual noise and clutter of modern SaaS dashboards. It assists the user in intentional daily time-blocking, goal tracking with subtasks, and instant intelligent activity recommendation based on free time windows.

The app uses local-first architecture (localStorage abstraction ready for SQLite migration) and provides clear, pure tool actions ready for AI agent integration.

---

## 2. Architecture & Folder Structure

```text
/
├── PLAN.md                     # Roadmap, folder structure, and working state
├── DESIGN.md                   # Aesthetic principles, tokens, and visual rules
├── index.html                  # HTML entrypoint with font imports (Fraunces & Inter)
├── package.json
├── tsconfig.json
├── tsconfig.app.json
├── vite.config.ts              # Vite configuration (with Vitest & Tailwind)
├── src/
│   ├── main.tsx                # App bootstrap
│   ├── App.tsx                 # Minimal blank app shell (editorial header, status bar, container)
│   ├── core/
│   │   ├── types.ts            # Type definitions: Goal, Subtask, Block, Recurrence, FreeWindow, NowSuggestion
│   │   ├── storage.ts          # Storage abstraction interface & LocalStorage implementation
│   │   ├── store.ts            # Zustand store integrated with storage adapter
│   │   ├── actions.ts          # Pure domain logic functions with JSDoc annotations
│   │   ├── seed.ts             # Default initial seed data (2 goals with subtasks, college block)
│   │   └── __tests__/
│   │       ├── actions.test.ts # Vitest suite for getFreeWindows and getNowSuggestion
│   │       └── store.test.ts   # Store/storage unit tests
│   └── styles/
│       ├── tokens.css          # Design tokens (paper colors, ink, accent, serif/sans fonts, 8px grid)
│       └── main.css            # Tailwind directives, CSS reset, typography utilities
```

---

## 3. Milestones & Progress

- [x] **Milestone 1: Project Blueprint & Foundation Planning**
  - Create `PLAN.md` and `DESIGN.md` in project root.
  - Establish mandatory workflow rules.
- [x] **Milestone 2: Design Tokens & Styling Infrastructure**
  - Create `src/styles/tokens.css` with CSS variables for paper (#F6F3EE), ink (#1B1A17), muted dark mode, single terra/amber accent, serif/sans font variables, and 8px spacing scale.
  - Configure Tailwind with Vite and import Google Fonts (Fraunces + Inter) with tabular numbers.
- [x] **Milestone 3: Data Model & Storage Layer**
  - Define `Goal`, `Subtask`, `Block` (with recurring fixed support, e.g. college Mon–Sat) in `src/core/types.ts`.
  - Build swap-ready storage interface in `src/core/storage.ts` (currently localStorage, easily swappable for SQLite).
  - Setup Zustand store in `src/core/store.ts`.
- [x] **Milestone 4: Pure Actions & AI Tool Logic**
  - Implement JSDoc-documented plain actions in `src/core/actions.ts`:
    - `addGoal`, `updateGoal`, `deleteGoal`
    - `addSubtask`, `toggleSubtask`
    - `addBlock`, `updateBlock`, `deleteBlock`
    - `getBlocksForDate(date)` (supporting recurring blocks)
    - `getFreeWindows(date)`
    - `getNowSuggestion(now)` (returns current block or best matching subtask for available window)
  - Configure seed data with 2 goals with subtasks, and college recurring block (weekdays 09:00–19:00).
- [x] **Milestone 5: Verification & Tests**
  - Write and run Vitest tests for `getFreeWindows` and `getNowSuggestion`.
  - Validate all edge cases (exact bounds, overlapping, overnight boundaries, empty days).
- [x] **Milestone 6: Blank App Shell UI**
  - Build minimal, elegant app shell in `App.tsx` showcasing warm paper texture/tones, hairline borders, typography, theme toggle, and live status of storage and seed data.
  - Zero clutter, no default SaaS widgets.

---

## 4. Current State & Next Steps
- **Current State**: Blank app shell and foundation completely built, seed data integrated, 15/15 Vitest tests passing, build passing.
- **Future UI Steps (Do NOT build until requested)**:
  1. *Daily Timeblock Canvas*: 24h hairline grid with tactile fixed and flexible blocks.
  2. *Editorial Goal Ledger*: Muted desaturated badges, subtask progress checkmarks, estimate tallies.
  3. *AI Assistant Tool Bridge*: Expose `src/core/actions.ts` via tool schemas / copilot interface.
  4. *SQLite Persistence Upgrade*: Swap `LocalStorageAdapter` for SQLite (e.g. wa-sqlite / sql.js or backend adapter).

