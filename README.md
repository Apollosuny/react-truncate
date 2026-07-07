# @apollosuny/react-truncate

[![npm version](https://img.shields.io/npm/v/@apollosuny/react-truncate)](https://www.npmjs.com/package/@apollosuny/react-truncate)
[![bundle size](https://img.shields.io/bundlephobia/minzip/@apollosuny/react-truncate)](https://bundlephobia.com/package/@apollosuny/react-truncate)
[![license](https://img.shields.io/npm/l/@apollosuny/react-truncate)](./LICENSE)
[![react](https://img.shields.io/badge/react-18%20%7C%2019-blue)](https://react.dev)

A pixel-accurate, responsive React text truncation component with inline "see more / see less" toggle.

Unlike CSS `-webkit-line-clamp`, this library uses `canvas.measureText()` and binary search to find the exact character cutoff at any container width, font, or letter-spacing — then re-runs automatically on resize.

---

## Features

- **Pixel-accurate** — `canvas.measureText()` + binary search, not CSS hacks
- **Responsive** — `ResizeObserver` recalculates on every container resize
- **Inline toggle** — place "see more" _and_ "see less" at the end of the last line, like Facebook
- **Unstyled** — zero CSS shipped; style with `className`, Tailwind, CSS Modules, anything
- **Composable** — compound component API (`<Truncate.Content>`, `<Truncate.Toggle>`)
- **`asChild`** — render the toggle as any element (e.g. `<a>`, a custom button) via a built-in slot
- **Emoji-safe** — cuts on grapheme clusters (`Intl.Segmenter`), so emoji, flags, and combining marks are never split
- **Zero dependencies** — no runtime dependencies; only a `react` peer
- **Controlled + uncontrolled** — `expanded` / `defaultExpanded` / `onExpandedChange`
- **Accessible** — `aria-expanded` / `aria-controls` wired automatically, and the **full text stays readable by screen readers** while visually clipped
- **Font-aware** — re-measures after web fonts load, so the cutoff doesn't drift
- **RSC-ready** — ships a `"use client"` directive, so it drops straight into a Next.js App Router server component with no wrapper, and still SSRs to HTML
- **TypeScript** — full type definitions included

---

## Installation

```bash
npm install @apollosuny/react-truncate
# or
pnpm add @apollosuny/react-truncate
# or
yarn add @apollosuny/react-truncate
```

**Peer dependencies:** `react@^18 || ^19`

---

## Quick Start

The simplest form — a string child plus `moreLabel` / `lessLabel`. The library
renders accessible inline buttons for you (wired with `aria-expanded` /
`aria-controls`):

```tsx
import { Truncate } from "@apollosuny/react-truncate";

export function Post({ body }: { body: string }) {
  return (
    <Truncate lines={3} moreLabel="See more" lessLabel="See less">
      {body}
    </Truncate>
  );
}
```

Style the generated buttons via the `[data-truncate="toggle"]` attribute (the
library ships zero CSS otherwise).

Need full control over the markup and placement? Use the compound API:

```tsx
import { Truncate } from "@apollosuny/react-truncate";

export function Post({ body }: { body: string }) {
  return (
    <Truncate lines={3}>
      <Truncate.Content
        ellipsis="... "
        more={(toggle) => (
          <button onClick={toggle} className="font-semibold text-blue-600">
            See more
          </button>
        )}
        less={(toggle) => (
          <button onClick={toggle} className="font-semibold text-blue-600">
            See less
          </button>
        )}
      >
        {body}
      </Truncate.Content>
    </Truncate>
  );
}
```

> `more` sits inline at the end of the last clipped line; `less` sits inline at
> the end of the full text once expanded. Prefer these over `<Truncate.Toggle>`
> when you want the control on the same line as the text. Use `<Truncate.Toggle>`
> when you want a separate, block-level control instead.

---

## API

### `<Truncate>`

Root provider. Renders a `<div>` by default.

| Prop | Type | Default | Description |
|---|---|---|---|
| `lines` | `number` | `3` | Maximum lines before truncation |
| `expanded` | `boolean` | — | Controlled expanded state |
| `defaultExpanded` | `boolean` | `false` | Initial state (uncontrolled) |
| `onExpandedChange` | `(expanded: boolean) => void` | — | Fired on every toggle |
| `ellipsis` | `ReactNode` | `"... "` | **Shorthand mode only** — forwarded to the auto-rendered `Content` |
| `moreLabel` | `ReactNode` | — | **Shorthand mode only** — see `<Truncate.Content>` |
| `lessLabel` | `ReactNode` | — | **Shorthand mode only** — see `<Truncate.Content>` |

Accepts all `<div>` props. Exposes `data-state="truncated"` or `data-state="expanded"` for CSS targeting.

> **Shorthand mode.** When `children` is a plain string, the root renders a
> `<Truncate.Content>` for you and forwards `ellipsis` / `moreLabel` /
> `lessLabel`. Pass `<Truncate.Content>` / `<Truncate.Toggle>` children
> explicitly to opt into the full compound API instead (these props are ignored
> then).

---

### `<Truncate.Content>`

The text container. Renders a block `<span>`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `string` | **required** | Plain string to truncate (see note below) |
| `ellipsis` | `ReactNode` | `"... "` | Rendered before `more` at the cutoff point |
| `more` | `(toggle: () => void) => ReactNode` | — | Inline element placed at the end of the last truncated line |
| `less` | `(toggle: () => void) => ReactNode` | — | Inline element placed at the end of the full text once expanded |
| `moreLabel` | `ReactNode` | — | Shorthand for `more`: renders a default accessible inline `<button>`. Ignored when `more` is set |
| `lessLabel` | `ReactNode` | — | Shorthand for `less`. Ignored when `less` is set |

Accepts all `<span>` props.

> **Labels vs render-props.** `moreLabel` / `lessLabel` render a default
> `<button data-truncate="toggle">` with `onClick`, `aria-expanded`, and
> `aria-controls` wired automatically — the zero-config path. Use `more` /
> `less` when you need custom markup; they take precedence over the labels.

> **Plain text only.** `children` must be a string — measurement is done with
> `canvas.measureText()`, which can't measure arbitrary JSX. For rich content
> (links, mentions, emoji rendered as nodes), this library is not the right fit.

---

### `<Truncate.Toggle>`

A separate, block-level control rendered outside the truncated text. Hidden automatically when the text is not truncated and not expanded. For an _inline_ control, use the `more` / `less` props on `<Truncate.Content>` instead.

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode \| (state: { expanded: boolean }) => ReactNode` | **required** | Label or render-prop |
| `asChild` | `boolean` | `false` | Merges props onto the child element instead of rendering a `<button>` |
| `contentId` | `string` | — | Override the `aria-controls` target. Defaults to the `<Truncate.Content>` id automatically |

Sets `aria-expanded` and `aria-controls` automatically — `aria-controls` points at the `<Truncate.Content>` region by default, with no wiring required.

---

### `useTruncate()`

Access the truncation context from any component nested inside `<Truncate>`.

```tsx
import { useTruncate } from "@apollosuny/react-truncate";

function CustomBadge() {
  const { isTruncated, expanded } = useTruncate();
  if (!isTruncated || expanded) return null;
  return <span className="text-xs text-gray-400">truncated</span>;
}
```

| Field | Type | Description |
|---|---|---|
| `expanded` | `boolean` | Current expanded state |
| `isTruncated` | `boolean` | Whether the text is actually clipped |
| `lines` | `number` | The configured line limit |
| `toggle` | `() => void` | Toggle expanded state |

---

## Patterns

### Facebook-style — inline "See more" / "See less"

The `more` prop places a clickable element at the end of the last clipped line; `less` places one at the end of the full text once expanded. Both stay on the same line as the text.

```tsx
<Truncate lines={3}>
  <Truncate.Content
    ellipsis="... "
    more={(toggle) => (
      <button onClick={toggle} className="font-semibold text-blue-600">
        See more
      </button>
    )}
    less={(toggle) => (
      <button onClick={toggle} className="font-semibold text-blue-600">
        See less
      </button>
    )}
  >
    {text}
  </Truncate.Content>
</Truncate>
```

### Block-level toggle below the text

Use `<Truncate.Toggle>` when you want the control on its own line instead of inline. It renders a `<button>` (or any element via `asChild`) and wires up `aria-expanded` / `aria-controls` automatically.

```tsx
<Truncate lines={3}>
  <Truncate.Content
    ellipsis="... "
    more={(toggle) => (
      <button onClick={toggle} className="font-semibold text-blue-600">
        See more
      </button>
    )}
  >
    {text}
  </Truncate.Content>

  <Truncate.Toggle className="mt-1 font-semibold text-blue-600">
    {({ expanded }) => (expanded ? "See less" : null)}
  </Truncate.Toggle>
</Truncate>
```

### Expand-only (no collapse)

Omit `Truncate.Toggle` entirely. Once expanded, the text stays expanded.

```tsx
<Truncate lines={3}>
  <Truncate.Content
    ellipsis="... "
    more={(toggle) => (
      <button onClick={toggle} className="text-blue-600">
        Show more
      </button>
    )}
  >
    {text}
  </Truncate.Content>
</Truncate>
```

### Controlled state

Drive the expanded state from outside the component.

```tsx
const [open, setOpen] = useState(false);

<Truncate lines={3} expanded={open} onExpandedChange={setOpen}>
  <Truncate.Content
    more={(toggle) => <button onClick={toggle}>See more</button>}
  >
    {text}
  </Truncate.Content>
  <Truncate.Toggle>
    {({ expanded }) => (expanded ? "See less" : null)}
  </Truncate.Toggle>
</Truncate>
```

### Custom ellipsis

```tsx
<Truncate lines={2}>
  <Truncate.Content
    ellipsis=" "
    more={(toggle) => <button onClick={toggle}>[read more]</button>}
  >
    {text}
  </Truncate.Content>
</Truncate>
```

### Toggle as a custom element (`asChild`)

```tsx
<Truncate.Toggle asChild>
  {({ expanded }) =>
    expanded ? <a href="#">See less</a> : null
  }
</Truncate.Toggle>
```

### CSS `data-state` targeting

```tsx
<Truncate lines={3} className="post-body">
  {/* ... */}
</Truncate>
```

```css
.post-body[data-state="truncated"] { border-left: 3px solid orange; }
.post-body[data-state="expanded"]  { border-left: 3px solid green; }
```

### With Tailwind CSS

```tsx
<Truncate lines={4}>
  <Truncate.Content
    className="text-gray-700 leading-relaxed"
    more={(toggle) => (
      <button
        onClick={toggle}
        className="font-semibold text-blue-600 hover:underline"
      >
        see more
      </button>
    )}
  >
    {article.body}
  </Truncate.Content>

  <Truncate.Toggle className="mt-2 text-sm font-semibold text-blue-600 hover:underline">
    {({ expanded }) => (expanded ? "see less" : null)}
  </Truncate.Toggle>
</Truncate>
```

---

## Comparison

### vs CSS `line-clamp` / `-webkit-line-clamp`

CSS line clamping is the right default when you only need to cap lines with a
trailing `…`. Reach for this library when that isn't enough:

| | CSS `line-clamp` | This library |
|---|---|---|
| Standardization | Unprefixed form still a Working Draft; only `-webkit-line-clamp` resolves everywhere (not Baseline) | JS, works wherever `Canvas` + `ResizeObserver` do (≈ every browser since 2020) |
| Inline "see more" at the exact cutoff | ✗ (clamps text only; no room for a trailing control on the same line) | ✓ |
| Cutoff accuracy | Approximate near the boundary | Pixel-accurate (`measureText` + binary search) |
| `isTruncated` detection | ✗ | ✓ via `useTruncate()` |
| Custom ellipsis node | ✗ | ✓ |
| Cost | Zero JS | Measurement runs on the client |

If you don't need the inline toggle, exact cutoff, or truncation detection,
plain CSS is lighter — use it.

### vs JSX-truncating libraries (`react-truncate-markup`, `@re-dev/react-truncate`)

Those measure rendered DOM, so they can truncate **arbitrary JSX** (links,
mentions, badges). This library measures with `canvas.measureText()`, which is
faster and pixel-exact but **plain-string only**. Choose based on content:

- **Rich/JSX content** (inline links, formatted spans) → use a DOM-measuring
  library.
- **Plain text** (post bodies, descriptions, comments) with an exact inline
  toggle and zero-CSS styling → this library.

## How it works

1. A `ResizeObserver` watches the container and reads its exact pixel width via `getBoundingClientRect()`.
2. `window.getComputedStyle()` captures the element's font (family, size, weight, style) and `letter-spacing`.
3. A hidden `<canvas>` runs `measureText()` to determine character widths, with a manual correction for `letter-spacing` (which the Canvas API ignores).
4. For each line up to `lines - 1`, a binary search over words finds the last word that fits.
5. On the final line, a binary search over characters finds the exact cutoff point, leaving room for `ellipsis` and `more`.
6. When the container resizes — or when web fonts finish loading — steps 1–5 repeat automatically.

This approach is accurate across any font, size, or container width — unlike `-webkit-line-clamp`, which produces slightly wrong results near the breakpoint and cannot accommodate an inline toggle element.

---

## Accessibility

- **Full text for screen readers.** While collapsed, the visible text is a clipped fragment of a sentence. That fragment is hidden from assistive tech (`aria-hidden`), and the **complete text** is exposed via a visually-hidden copy — so screen-reader users get the whole content, not a cut-off phrase.
- **Focusable controls stay announced.** The inline `more` / `less` toggle is rendered outside the `aria-hidden` region, so it remains reachable by keyboard and screen readers.
- **Wired disclosure semantics.** `<Truncate.Toggle>` sets `aria-expanded` and points `aria-controls` at the `<Truncate.Content>` region automatically.
- **Zero CSS dependency.** The visually-hidden styles are inlined; you don't need a global `.sr-only` utility.

> If you wire up an inline `more` / `less` button yourself, add `aria-expanded={expanded}` to it for full disclosure semantics. `<Truncate.Toggle>` does this for you.

---

## Browser support

All modern browsers (Chrome ≥ 79, Firefox ≥ 69, Safari ≥ 13.1, Edge ≥ 79).  
Requires `ResizeObserver` and `HTMLCanvasElement` — both universally supported since 2020.

---

## License

MIT © [apollosuny](https://github.com/apollosuny)
