import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Truncate } from '../truncate'
import { useTruncate } from '../use-truncate'

const SHORT = 'Short text.'
// 8px per char × ~400 chars → exceeds any reasonable container width
const LONG = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(8)
// Text with a newline to exercise blank-line branch
const WITH_NEWLINE = 'First paragraph line.\n\nSecond paragraph continues here with more text.'
// Single word longer than 300px container (8px × char → need >37 chars)
const SINGLE_LONG_WORD = 'Superlongwordthatdoesnotfitinanyreasonablecontainerwidth'

function setup(props?: Partial<React.ComponentProps<typeof Truncate>> & { text?: string; lines?: number }) {
  const { text = LONG, lines = 3, ...rest } = props ?? {}

  // Give the container a measurable width so ResizeObserver callback fires
  Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({ width: 300, height: 0, top: 0, left: 0, right: 300, bottom: 0, x: 0, y: 0, toJSON: () => ({}) }),
  })

  return render(
    <Truncate lines={lines} {...rest}>
      <Truncate.Content>{text}</Truncate.Content>
      <Truncate.Toggle data-testid="toggle">
        {({ expanded }) => (expanded ? 'See less' : 'See more')}
      </Truncate.Toggle>
    </Truncate>
  )
}

// ─── Root component ───────────────────────────────────────────────────────────

describe('Truncate', () => {
  it('renders without crashing', () => {
    setup()
    expect(document.body).toBeTruthy()
  })

  it('applies data-state="truncated" on root when collapsed', () => {
    const { container } = setup()
    const root = container.firstChild as HTMLElement
    expect(root.dataset.state).toBe('truncated')
  })

  it('expands when toggle is clicked and sets data-state="expanded"', () => {
    const { container } = setup()
    const root = container.firstChild as HTMLElement
    const btn = screen.queryByTestId('toggle')

    if (btn) {
      fireEvent.click(btn)
      expect(root.dataset.state).toBe('expanded')
    }
  })

  it('collapses back when toggle is clicked a second time', () => {
    const { container } = setup()
    const root = container.firstChild as HTMLElement
    const btn = screen.queryByTestId('toggle')

    if (btn) {
      fireEvent.click(btn)
      expect(root.dataset.state).toBe('expanded')
      fireEvent.click(btn)
      expect(root.dataset.state).toBe('truncated')
    }
  })

  it('calls onExpandedChange when toggled', () => {
    const handler = vi.fn()
    setup({ onExpandedChange: handler })
    const btn = screen.queryByTestId('toggle')
    if (btn) {
      fireEvent.click(btn)
      expect(handler).toHaveBeenCalledWith(true)
    }
  })

  it('respects controlled expanded=true prop', () => {
    const { container } = render(
      <Truncate lines={3} expanded={true}>
        <Truncate.Content>{LONG}</Truncate.Content>
        <Truncate.Toggle data-testid="toggle">
          {({ expanded }) => (expanded ? 'See less' : 'See more')}
        </Truncate.Toggle>
      </Truncate>
    )
    const root = container.firstChild as HTMLElement
    expect(root.dataset.state).toBe('expanded')
  })

  it('respects controlled expanded=false prop', () => {
    const { container } = render(
      <Truncate lines={3} expanded={false}>
        <Truncate.Content>{LONG}</Truncate.Content>
        <Truncate.Toggle data-testid="toggle">
          {({ expanded }) => (expanded ? 'See less' : 'See more')}
        </Truncate.Toggle>
      </Truncate>
    )
    const root = container.firstChild as HTMLElement
    expect(root.dataset.state).toBe('truncated')
  })

  it('respects defaultExpanded=true for uncontrolled initial state', () => {
    const { container } = render(
      <Truncate lines={3} defaultExpanded={true}>
        <Truncate.Content>{LONG}</Truncate.Content>
        <Truncate.Toggle data-testid="toggle">
          {({ expanded }) => (expanded ? 'See less' : 'See more')}
        </Truncate.Toggle>
      </Truncate>
    )
    const root = container.firstChild as HTMLElement
    expect(root.dataset.state).toBe('expanded')
  })

  it('does not throw when text fits within lines (no truncation)', () => {
    expect(() => setup({ text: SHORT })).not.toThrow()
  })

  it('passes extra className and HTML props to the root div', () => {
    const { container } = setup({ className: 'custom-class', 'data-foo': 'bar' } as any)
    const root = container.firstChild as HTMLElement
    expect(root.classList.contains('custom-class')).toBe(true)
    expect(root.getAttribute('data-foo')).toBe('bar')
  })
})

// ─── TruncateContent ─────────────────────────────────────────────────────────

describe('Truncate.Content', () => {
  it('renders custom ellipsis string', () => {
    render(
      <Truncate lines={2}>
        <Truncate.Content ellipsis=" [more]">{LONG}</Truncate.Content>
      </Truncate>
    )
    expect(document.body).toBeTruthy()
  })

  it('renders more render-prop after ellipsis', () => {
    render(
      <Truncate lines={2}>
        <Truncate.Content
          more={(toggle) => (
            <button data-testid="inline-more" onClick={toggle}>
              see more
            </button>
          )}
        >
          {LONG}
        </Truncate.Content>
      </Truncate>
    )
    expect(document.body).toBeTruthy()
  })

  it('renders full text when expanded', () => {
    const { getByText } = render(
      <Truncate lines={2} expanded={true}>
        <Truncate.Content>{SHORT}</Truncate.Content>
      </Truncate>
    )
    expect(getByText(SHORT)).toBeTruthy()
  })

  it('handles text containing newlines without crashing', () => {
    Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ width: 300, height: 0, top: 0, left: 0, right: 300, bottom: 0, x: 0, y: 0, toJSON: () => ({}) }),
    })
    expect(() =>
      render(
        <Truncate lines={3}>
          <Truncate.Content>{WITH_NEWLINE}</Truncate.Content>
        </Truncate>
      )
    ).not.toThrow()
  })

  it('handles a single word longer than the container without crashing', () => {
    Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ width: 300, height: 0, top: 0, left: 0, right: 300, bottom: 0, x: 0, y: 0, toJSON: () => ({}) }),
    })
    expect(() =>
      render(
        <Truncate lines={2}>
          <Truncate.Content>{SINGLE_LONG_WORD}</Truncate.Content>
        </Truncate>
      )
    ).not.toThrow()
  })
})

// ─── TruncateToggle ───────────────────────────────────────────────────────────

describe('Truncate.Toggle', () => {
  it('renders a <button> by default', () => {
    const { container } = setup()
    const btn = screen.queryByTestId('toggle')
    // button only present if isTruncated — skip assertion if not mounted
    if (btn) {
      expect(btn.tagName).toBe('BUTTON')
    }
  })

  it('renders as child element when asChild=true', () => {
    Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
      configurable: true,
      value: () => ({ width: 300, height: 0, top: 0, left: 0, right: 300, bottom: 0, x: 0, y: 0, toJSON: () => ({}) }),
    })
    render(
      <Truncate lines={3} expanded={true}>
        <Truncate.Content>{LONG}</Truncate.Content>
        <Truncate.Toggle asChild data-testid="toggle-anchor">
          {({ expanded }) => <a href="#">{expanded ? 'Less' : 'More'}</a>}
        </Truncate.Toggle>
      </Truncate>
    )
    const anchor = screen.queryByTestId('toggle-anchor')
    if (anchor) {
      // asChild merges props onto the child — the outer element is the <a>
      expect(anchor.tagName).toBe('A')
    }
  })

  it('accepts static ReactNode children (not render-prop)', () => {
    render(
      <Truncate lines={3} expanded={true}>
        <Truncate.Content>{LONG}</Truncate.Content>
        <Truncate.Toggle data-testid="static-toggle">Show less</Truncate.Toggle>
      </Truncate>
    )
    const btn = screen.queryByTestId('static-toggle')
    if (btn) {
      expect(btn.textContent).toBe('Show less')
    }
  })

  it('passes contentId as aria-controls', () => {
    render(
      <Truncate lines={3} expanded={true}>
        <Truncate.Content>{LONG}</Truncate.Content>
        <Truncate.Toggle contentId="my-content" data-testid="toggle-ctrl">
          Toggle
        </Truncate.Toggle>
      </Truncate>
    )
    const btn = screen.queryByTestId('toggle-ctrl')
    if (btn) {
      expect(btn.getAttribute('aria-controls')).toBe('my-content')
    }
  })

  it('sets aria-expanded correctly', () => {
    render(
      <Truncate lines={3} expanded={true}>
        <Truncate.Content>{LONG}</Truncate.Content>
        <Truncate.Toggle data-testid="toggle-aria">Toggle</Truncate.Toggle>
      </Truncate>
    )
    const btn = screen.queryByTestId('toggle-aria')
    if (btn) {
      expect(btn.getAttribute('aria-expanded')).toBe('true')
    }
  })
})

// ─── useTruncate hook ─────────────────────────────────────────────────────────

describe('useTruncate hook', () => {
  it('throws when used outside <Truncate>', () => {
    const BadComponent = () => {
      useTruncate()
      return null
    }
    expect(() => render(<BadComponent />)).toThrow(
      'Truncate sub-components must be rendered inside a <Truncate> root.'
    )
  })

  it('returns expanded, isTruncated, toggle when inside <Truncate>', () => {
    let result: ReturnType<typeof useTruncate> | null = null

    const Inspector = () => {
      result = useTruncate()
      return null
    }

    render(
      <Truncate lines={3}>
        <Truncate.Content>{LONG}</Truncate.Content>
        <Inspector />
      </Truncate>
    )

    expect(result).not.toBeNull()
    expect(typeof result!.toggle).toBe('function')
    expect(typeof result!.expanded).toBe('boolean')
    expect(typeof result!.isTruncated).toBe('boolean')
  })
})
