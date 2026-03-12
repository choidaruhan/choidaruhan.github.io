# Project Rules & Principles

This document defines the core principles and coding standards for this project to maintain consistency and clarity.

## 1. File & Function Principle

- **One Function Per File**: Every logic-related file should contain and export exactly one primary function.
- **Naming Consistency**: The filename must exactly match the name of the exported function.
  - Example: `getFetchPosts.ts` exports `getFetchPosts`.
- **Location**:
  - `src/`: Root source directory.
    - `main.ts`, `App.svelte`, `app.css`: Application entry points.
    - `routes/`: Page-level components/layouts (if applicable).
    - `components/`: UI components.
    - `core/`: All shared logic and data (State, API, Types, etc.).
      - `stores/`: Application state management.
      - `api/`: API integration.
      - `types/`: TypeScript definitions.
      - `constants/`: Fixed global values.
      - `config/`: Environment and runtime configuration.

## 2. Variable & Constant Organization

### 2.1 Global Constants
- **Path**: `src/core/constants/`
- **Naming**: `UPPER_SNAKE_CASE.ts` matching the export name.
- **Example**: `API_BASE.ts` -> `export const API_BASE = ...`

### 2.2 Global Reactive State (Stores)
- **Path**: `src/core/stores/`
- **Naming**: `camelCase.ts` matching the export name.
- **Example**: `posts.ts` -> `export const posts = writable([])`

### 2.3 Configuration & Environment
- **Path**: `src/core/config/`
- **Naming**: `camelCase.ts` matching the export name or a descriptive name.
- **Example**: `isProduction.ts` -> `export const isProduction = ...`

### 2.4 Local Variables
- Variables that are only used within a single function should remain inside that function's file.
- If a local variable becomes shared or grows too complex, move it to `constants` or `config`.

## 3. Development Workflow

- **Refactoring**: When adding new functionality, ensure it doesn't violate the "one function per file" rule. If a function becomes too large, split it into smaller functions in separate files.
