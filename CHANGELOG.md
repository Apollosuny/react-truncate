# Changelog

All notable changes to this project will be documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

---

## [0.1.0] — 2026-05-13

### Added
- `<Truncate>` root component with controlled and uncontrolled `expanded` state
- `<Truncate.Content>` — pixel-accurate truncation via `canvas.measureText()` and binary search
- `<Truncate.Toggle>` — accessible toggle button with `asChild` support via Radix Slot
- `useTruncate()` hook for accessing truncate state from custom components
- `ResizeObserver` integration for responsive recalculation on container resize
- `ellipsis` and `more` props on `<Truncate.Content>` for customisable last-line rendering
- `data-state` attribute on root (`"truncated"` | `"expanded"`) for CSS targeting
- Dual ESM/CJS build with TypeScript declarations (`.d.ts` and `.d.mts`)
- SSR-safe via `useIsomorphicLayoutEffect`
- React 18 and 19 peer dependency support

[Unreleased]: https://github.com/apollosuny/react-truncate/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/apollosuny/react-truncate/releases/tag/v0.1.0
