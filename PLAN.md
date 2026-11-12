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
│   ├── App.tsx                 # Main layout: TimetableHeader, GoalsSidebar, NowCard, WeekGrid, Slide-over, Modal
│   ├── components/
│   │   └── timetable/
│   │       ├── TimetableHeader.tsx  # Week navigation (< Today >), Goals toggle, Theme switch
│   │       ├── NowCard.tsx          # Hero "Now" card with getNowSuggestion, "Done", and "Skip"
│   │       ├── WeekGrid.tsx         # 7-day time grid (07:00-23:00), hairline rules, current-time marker
│   │       ├── DaySlideOver.tsx     # Slide-over daily plan notes and block manager
│   │       ├── BlockEditModal.tsx   # Direct block editor dialog for grid blocks
│   │       └── GoalsSidebar.tsx     # Collapsible reserved goals panel with smooth slide animation
│   ├── core/
│   │   ├── types.ts            # Type definitions: Goal, Subtask, Block, Recurrence, FreeWindow, NowSuggestion
│   │   ├── storage.ts          # Storage abstraction interface & LocalStorage implementation
│   │   ├── dayNotes.ts         # Persistent daily focus intention notes storage
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
- [x] **Milestone 6: Main Timetable Screen**
  - Build week view with 7 day columns and hour rows (07:00–23:00).
  - Current-time horizontal indicator line on today's column with live time badge.
  - Fixed blocks (college) rendered in quiet muted tones; flexible blocks rendered in rich paper with goal accent strips.
  - Prominent "Now" card driven by `getNowSuggestion` featuring:
    - Current block or suggested subtask with estimate and goal deadline.
    - Tabular duration counters ("how long", "what comes next").
    - "Done" button (completes subtask or block and refreshes suggestion).
    - "Skip, suggest another" button (cycles through alternate fitting candidates).
  - Collapsible Goals Panel on the left with smooth 200ms slide transition, resizing timetable.
  - Day Slide-Over panel opened by clicking any date header:
    - Persistent daily focus intention notes.
    - Schedule listing with inline edit/delete.
    - Add block form with title, start, end, nature (fixed/flexible), and goal linking.
  - Click-to-edit block modal for all grid blocks with delete confirmation.
  - Zero linter warnings, 15/15 tests passing, responsive down to 1024px.

---

## 4. Current State & Next Steps
- **Current State**: Main Timetable Screen fully operational, backed by pure actions and persistent storage.
- **Next Milestone**:
  1. *Interactive Goals Ledger Panel*: Expand the left panel into a full interactive goal management system (create/edit goals, add subtasks, re-order, estimate tallies).
  2. *AI Assistant Tool Bridge*: Expose `src/core/actions.ts` via structured tool declarations.
  3. *SQLite Persistence Upgrade*: Swap `LocalStorageAdapter` for SQLite WASM.
