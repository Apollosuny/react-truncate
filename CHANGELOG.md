# Changelog

All notable changes to this project will be documented here.

Format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).
This project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

---

## [Unreleased]

### Changed
- Releases are now published manually from a maintainer's machine; removed the tag-triggered GitHub Actions release workflow

---

## [0.3.2] — 2026-10-03

No runtime changes; the published bundle is functionally identical to 0.3.1.

### Changed
- `package.json`: rewrote `description` and expanded discovery keywords; removed the unverified `rtl` and misleading `server-component` keywords
- README: added a comparison against other React truncation packages and a Limitations section

---

## [0.3.1] — 2026-09-29

No runtime changes; the published bundle is functionally identical to 0.3.0.

### Security
- Updated development dependencies within their semver ranges, including `vitest` (>=3.2.6, fixes a critical advisory in the Vitest UI server). Production dependency audit remains clean and the package still has zero runtime dependencies
- `SECURITY.md`: added GitHub private vulnerability reporting as the preferred reporting channel

### Changed
- CI: hardened the release and security workflows (least-privilege permissions, pinned actions, tag/version verification)
- `package.json`: added `homepage`, `bugs` and additional discovery keywords

---

## [0.3.0] — 2026-07-07

### Added
- **Simple mode** — `moreLabel` / `lessLabel` on `<Truncate.Content>` render a default, accessible inline `<button data-truncate="toggle">` (wired with `onClick`, `aria-expanded`, `aria-controls`), so the common case no longer needs a render-prop. Explicit `more` / `less` still take precedence
- **String shorthand** — `<Truncate>` now accepts a plain string child and auto-renders a `<Truncate.Content>`, forwarding `ellipsis` / `moreLabel` / `lessLabel`. The compound API is unchanged when element children are passed
- **`"use client"` directive** — emitted on both bundles so the component drops into a Next.js App Router server component without a manual client wrapper

### Fixed
- **Grapheme-safe truncation** — the last-line cut is now computed over grapheme clusters (via `Intl.Segmenter`, with a code-point fallback) instead of UTF-16 code units, so it never splits an emoji, regional-indicator flag, ZWJ sequence, or a base character + combining mark into a broken glyph

### Changed
- **Zero runtime dependencies** — dropped `@radix-ui/react-slot`. The `asChild` behaviour is now backed by a minimal internal slot that merges props, composes event handlers, and concatenates `className` / `style`. No API change
- Dev-only `console.warn` when `<Truncate.Content>` receives a non-string child, pointing to JSX-capable alternatives (stripped from production builds)
- README: added "vs CSS `line-clamp`" and "vs JSX-truncating libraries" comparison sections

---

## [0.2.0] — 2026-06-06

### Added
- `less` prop on `<Truncate.Content>`, symmetric with `more` — keeps the "see less" control inline on the same line as the text once expanded
- Font-aware re-measurement: the cutoff is recalculated after web fonts finish loading (`document.fonts.ready`), so it no longer drifts when a custom font resolves after first paint
- `useTruncate()` now also returns `lines`, matching its documented contract

### Fixed
- `aria-controls` is now wired automatically from `<Truncate.Toggle>` to the `<Truncate.Content>` region (the generated id was previously never applied)
- Full text is exposed to assistive tech while truncated: the clipped fragment is hidden from the accessibility tree and the complete text is provided via a visually-hidden copy; the inline toggle stays focusable and announced
- Measurement no longer re-runs on every render — the `more` callback was dropped from the measurement effect's dependencies, so passing an inline closure (the common case) no longer triggers redundant re-measurements

### Changed
- CI dependency audit now scopes to production dependencies (`pnpm audit --prod`), matching the security surface consumers actually install

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

[Unreleased]: https://github.com/apollosuny/react-truncate/compare/v0.3.2...HEAD
[0.3.2]: https://github.com/apollosuny/react-truncate/compare/v0.3.1...v0.3.2
[0.3.1]: https://github.com/apollosuny/react-truncate/compare/v0.3.0...v0.3.1
[0.3.0]: https://github.com/apollosuny/react-truncate/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/apollosuny/react-truncate/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/apollosuny/react-truncate/releases/tag/v0.1.0
