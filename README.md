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
- **Inline toggle** — place "see more" at the end of the last line, like Facebook
- **Unstyled** — zero CSS shipped; style with `className`, Tailwind, CSS Modules, anything
- **Composable** — compound component API (`<Truncate.Content>`, `<Truncate.Toggle>`)
- **`asChild`** — render the toggle as any element via Radix Slot
- **Controlled + uncontrolled** — `expanded` / `defaultExpanded` / `onExpandedChange`
- **Accessible** — `aria-expanded`, `aria-controls` wired automatically
- **SSR-safe** — no DOM access at module level
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
      >
        {body}
      </Truncate.Content>

      {/* Only visible when expanded */}
      <Truncate.Toggle className="mt-1 font-semibold text-blue-600">
        {({ expanded }) => (expanded ? "See less" : null)}
      </Truncate.Toggle>
    </Truncate>
  );
}
```

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

Accepts all `<div>` props. Exposes `data-state="truncated"` or `data-state="expanded"` for CSS targeting.

---

### `<Truncate.Content>`

The text container. Renders a block `<span>`.

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `string` | **required** | Plain string to truncate |
| `ellipsis` | `ReactNode` | `"... "` | Rendered before `more` at the cutoff point |
| `more` | `(toggle: () => void) => ReactNode` | — | Inline element placed at the end of the last truncated line |

Accepts all `<span>` props.

---

### `<Truncate.Toggle>`

Button rendered outside the truncated text. Hidden automatically when text is not truncated and not expanded.

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode \| (state: { expanded: boolean }) => ReactNode` | **required** | Label or render-prop |
| `asChild` | `boolean` | `false` | Merges props onto the child element instead of rendering a `<button>` |

Sets `aria-expanded` and `aria-controls` automatically.

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

### Facebook-style — inline "See more"

The `more` prop places a clickable element at the end of the last visible line. `Truncate.Toggle` renders "See less" after expanding.

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

## How it works

1. A `ResizeObserver` watches the container and reads its exact pixel width via `getBoundingClientRect()`.
2. `window.getComputedStyle()` captures the element's font (family, size, weight, style) and `letter-spacing`.
3. A hidden `<canvas>` runs `measureText()` to determine character widths, with a manual correction for `letter-spacing` (which the Canvas API ignores).
4. For each line up to `lines - 1`, a binary search over words finds the last word that fits.
5. On the final line, a binary search over characters finds the exact cutoff point, leaving room for `ellipsis` and `more`.
6. When the container resizes, steps 1–5 repeat automatically.

This approach is accurate across any font, size, or container width — unlike `-webkit-line-clamp`, which produces slightly wrong results near the breakpoint and cannot accommodate an inline toggle element.

---

## Browser support

All modern browsers (Chrome ≥ 79, Firefox ≥ 69, Safari ≥ 13.1, Edge ≥ 79).  
Requires `ResizeObserver` and `HTMLCanvasElement` — both universally supported since 2020.

---

## License

MIT © [apollosuny](https://github.com/apollosuny)
