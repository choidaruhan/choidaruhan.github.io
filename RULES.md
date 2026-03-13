# Project Rules & Principles

This document defines the core principles and coding standards for this project to maintain consistency and clarity.

## 1. File & Function Principle

- **One Function Per File**: Every logic-related file should contain and export exactly one primary function.
- **Naming Consistency**: The filename must exactly match the name of the exported function.
  - Example: `getFetchPosts.ts` exports `getFetchPosts`.
- **Location**:
  - `src/`: Root source directory.
    - `app.css`: Global styles.
    - `routes/`: SvelteKit file-based routing.
      - `+layout.svelte`: Global layout and shared UI elements.
      - `+page.svelte`: Route-specific components.
      - `+page.server.ts`: Server-side data loading (calling `core/infra`).
    - `lib/`: SvelteKit's library directory (accessible via `$lib`).
      - `components/`: UI components.
    - `core/`: All shared logic and data (DDD Layer).
      - `domain/`: Business logic grouped by domain (e.g., `posts`, `auth`).
      - `infra/`: Technical implementations (API integration, Routing).
      - `app/`: Application-level concerns.
        - `states/`: Application state management (Svelte 5 Runes).
        - `constants/`: Global fixed values.
        - `config/`: Environment configuration.
        - `boot/`: App initialization and mounting.
      - `shared/`: Generic helpers and definitions.
        - `utils/`: Common utility functions.
        - `types/`: Shared TypeScript definitions.

---

## 2. SvelteKit & DDD Harmony

To maintain the architectural integrity while using SvelteKit:

- **Framework Independence**: The `core/` directory must remain framework-agnostic. It should not directly use SvelteKit-specific APIs (like `page` store) unless absolutely necessary.
- **Data Flow**:
  1. `+page.server.ts` calls `core/infra` to fetch data.
  2. Data is passed to `+page.svelte` via the `data` prop.
  3. UI interactions trigger functions in `core/app` or `core/domain`.
- **State Management**: Use Svelte 5 Runes (`$state`, `$derived`) in `core/app/states` for reactive global state that transcends page navigation.

---

## 3. Variable & Constant Organization

### 2.1 Global Constants

- **Path**: `src/core/app/constants/`
- **Naming**: `UPPER_SNAKE_CASE.ts` matching the export name.
- **Example**: `API_BASE.ts` -> `export const API_BASE = ...`

### 2.2 Global Reactive States

- **Path**: `src/core/app/states/`
- **Naming**: `camelCase.ts` matching the export name.
- **Example**: `posts.ts` -> `export const posts = writable([])`

### 2.3 Configuration & Environment

- **Path**: `src/core/app/config/`
- **Naming**: `camelCase.ts` matching the export name or a descriptive name.
- **Example**: `isProduction.ts` -> `export const isProduction = ...`

### 2.4 Local Variables

- Variables that are only used within a single function should remain inside that function's file.
- If a local variable becomes shared or grows too complex, move it to `constants` or `config`.

## 3. Development Workflow

- **Refactoring**: When adding new functionality, ensure it doesn't violate the "one function per file" rule. If a function becomes too large, split it into smaller functions in separate files.
