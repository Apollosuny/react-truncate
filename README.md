# @apollosuny/react-truncate

A modern, pixel-accurate React text truncation component with show more / show less toggle.

- **Pixel-accurate** — uses `canvas.measureText()` + binary search, not line-clamp hacks
- **Responsive** — recalculates on container resize via `ResizeObserver`
- **Unstyled** — zero CSS bundled; style with `className`, Tailwind, CSS Modules, anything
- **Composable** — compound component API, `asChild` support via Radix Slot
- **Accessible** — `aria-expanded`, `aria-controls` wired automatically
- **SSR-safe** — no DOM access at module level
- **Controlled & uncontrolled** — `expanded` + `defaultExpanded` + `onExpandedChange`
- React 18 and 19 compatible

---

## Installation

```bash
npm install @apollosuny/react-truncate
# or
pnpm add @apollosuny/react-truncate
# or
yarn add @apollosuny/react-truncate
```

---

## Quick Start

```tsx
import { Truncate } from "@apollosuny/react-truncate";

export function Article({ body }: { body: string }) {
  return (
    <Truncate lines={3}>
      <Truncate.Content>{body}</Truncate.Content>
      <Truncate.Toggle>
        {({ expanded }) => (expanded ? "Show less" : "Show more")}
      </Truncate.Toggle>
    </Truncate>
  );
}
```

---

## API

### `<Truncate>` (root)

| Prop | Type | Default | Description |
|---|---|---|---|
| `lines` | `number` | `3` | Maximum visible lines before truncation |
| `expanded` | `boolean` | — | Controlled expanded state |
| `defaultExpanded` | `boolean` | `false` | Initial state for uncontrolled usage |
| `onExpandedChange` | `(expanded: boolean) => void` | — | Called on every toggle |

Accepts all `<div>` props. Sets `data-state="truncated"` or `data-state="expanded"` for CSS targeting.

---

### `<Truncate.Content>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `string` | **required** | The text to truncate. Must be a plain string. |
| `ellipsis` | `ReactNode` | `"... "` | Rendered at the end of the last truncated line |
| `more` | `(toggle: () => void) => ReactNode` | — | Inline node after `ellipsis` on the last truncated line |

Accepts all `<span>` props.

---

### `<Truncate.Toggle>`

| Prop | Type | Default | Description |
|---|---|---|---|
| `children` | `ReactNode \| (state: { expanded: boolean }) => ReactNode` | **required** | Button label or render-prop |
| `asChild` | `boolean` | `false` | Renders as child element instead of `<button>` |

Hidden automatically when text is not truncated and not expanded. Sets `aria-expanded` and `aria-controls`.

---

### `useTruncate()` hook

Access truncate state from any component inside `<Truncate>`.

```tsx
import { useTruncate } from "@apollosuny/react-truncate";

function CustomToggle() {
  const { expanded, isTruncated, toggle } = useTruncate();
  if (!isTruncated) return null;
  return <button onClick={toggle}>{expanded ? "Less" : "More"}</button>;
}
```

---

## Examples

### Custom ellipsis

```tsx
<Truncate lines={2}>
  <Truncate.Content ellipsis="…">
    {longText}
  </Truncate.Content>
</Truncate>
```

### Inline "see more" inside the truncated text

```tsx
<Truncate lines={3}>
  <Truncate.Content
    ellipsis="... "
    more={(toggle) => (
      <button onClick={toggle} className="text-blue-500 font-medium">
        see more
      </button>
    )}
  >
    {longText}
  </Truncate.Content>
</Truncate>
```

### Styling with `data-state`

```css
[data-state="truncated"] { /* collapsed styles */ }
[data-state="expanded"]  { /* expanded styles  */ }
```

### Controlled state

```tsx
const [open, setOpen] = useState(false);

<Truncate lines={3} expanded={open} onExpandedChange={setOpen}>
  <Truncate.Content>{body}</Truncate.Content>
  <Truncate.Toggle>
    {({ expanded }) => (expanded ? "Collapse" : "Expand")}
  </Truncate.Toggle>
</Truncate>
```

### `asChild` — render toggle as a custom element

```tsx
<Truncate.Toggle asChild>
  <a href="#" role="button">
    {({ expanded }) => (expanded ? "Show less" : "Show more")}
  </a>
</Truncate.Toggle>
```

### With Tailwind CSS

```tsx
<Truncate lines={4}>
  <Truncate.Content className="text-gray-700 leading-relaxed">
    {article.body}
  </Truncate.Content>
  <Truncate.Toggle className="mt-2 text-sm font-medium text-blue-600 hover:underline">
    {({ expanded }) => (expanded ? "Show less" : "Show more")}
  </Truncate.Toggle>
</Truncate>
```

---

## How it works

Unlike CSS `-webkit-line-clamp`, this library measures text using `canvas.measureText()` to calculate exactly how many characters fit on each line at the current container width. A binary search finds the precise cutoff point per line. A `ResizeObserver` re-runs the calculation whenever the container resizes, so it is accurate at any viewport or font size.

---

## Browser support

All modern browsers (Chrome, Firefox, Safari, Edge). Requires `ResizeObserver` and `HTMLCanvasElement` — both are universally supported since 2020.

---

## License

MIT © [apollosuny](https://github.com/apollosuny)
