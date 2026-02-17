# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

React Native library (`@baby-journey/rn-segmented-progress-bar`) providing an animated circular segmented progress bar using `react-native-svg` and React Native's Animated API.

## Commands

- **Test:** `yarn test`
- **Single test:** `yarn test -- --testPathPattern='helper'`
- **Type check:** `yarn typecheck`
- **Lint:** `yarn lint`
- **Build:** `yarn prepack` (uses react-native-builder-bob → lib/{commonjs,module,typescript})
- **Bootstrap:** `yarn bootstrap` (installs deps for both root and example app)

## Architecture

All source lives in `src/`:

- **`src/index.tsx`** — Single main component `RNSegmentedProgressBar`. Uses `forwardRef` + `useImperativeHandle` to expose a `run({ progress })` method that triggers segment-by-segment animation. Renders SVG circles for base track and progress overlay, plus an optional indicator dot. Wrapped in `React.memo`.

- **`src/helpers/index.ts`** — Two pure functions: `getPathValues` (distributes a progress percentage across N segments) and `getArcEndCoordinates` (calculates x,y position on the circular arc for the indicator).

- **`example/`** — Standalone React Native app for development/testing.

## Key Types

```typescript
export type RunAnimationHandler = {
  run: ({ progress }: { progress: number }) => void;
};
```

Consumers obtain a ref typed as `RunAnimationHandler` to imperatively trigger animations.

## Code Style

- Strict TypeScript (`noUnusedLocals`, `noUnusedParameters`, `noUncheckedIndexedAccess`)
- ESLint with `@react-native-community` config + Prettier (single quotes, 2-space indent, trailing commas ES5)
- Conventional commits enforced via commitlint (lefthook pre-commit hooks run lint + typecheck)

## Peer Dependencies

`react`, `react-native`, and `react-native-svg` (>13.7.0) are peer dependencies — do not add them as direct dependencies.
