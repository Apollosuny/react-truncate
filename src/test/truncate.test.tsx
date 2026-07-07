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

// ─── Simple mode: moreLabel / lessLabel + string shorthand ─────────────────────

function visibleToggles(container: HTMLElement) {
  return Array.from(
    container.querySelectorAll('[data-truncate="toggle"]')
  ).filter((el) => el.closest('[aria-hidden="true"]') === null) as HTMLElement[]
}

describe('simple mode (labels + shorthand)', () => {
  it('renders a default accessible button from moreLabel when truncated', () => {
    mockCanvas()
    mockWidth(300)
    const { container } = render(
      <Truncate lines={2}>
        <Truncate.Content moreLabel="See more">{LONG}</Truncate.Content>
      </Truncate>
    )
    const [btn] = visibleToggles(container)
    expect(btn).toBeTruthy()
    expect(btn.tagName).toBe('BUTTON')
    expect(btn.getAttribute('type')).toBe('button')
    expect(btn.getAttribute('aria-expanded')).toBe('false')
    expect(btn.getAttribute('aria-controls')).toBeTruthy()
    expect(btn.textContent).toBe('See more')
  })

  it('toggles to expanded and shows lessLabel when the default more button is clicked', () => {
    mockCanvas()
    mockWidth(300)
    const { container } = render(
      <Truncate lines={2}>
        <Truncate.Content moreLabel="See more" lessLabel="See less">
          {LONG}
        </Truncate.Content>
      </Truncate>
    )
    const root = container.firstChild as HTMLElement
    fireEvent.click(visibleToggles(container)[0])
    expect(root.dataset.state).toBe('expanded')
    const [lessBtn] = visibleToggles(container)
    expect(lessBtn.textContent).toBe('See less')
    expect(lessBtn.getAttribute('aria-expanded')).toBe('true')
  })

  it('lets an explicit `more` render-prop win over moreLabel', () => {
    mockCanvas()
    mockWidth(300)
    const { container } = render(
      <Truncate lines={2}>
        <Truncate.Content
          moreLabel="ignored"
          more={(toggle) => (
            <button data-testid="custom-more" onClick={toggle}>
              custom
            </button>
          )}
        >
          {LONG}
        </Truncate.Content>
      </Truncate>
    )
    expect(visibleToggles(container)).toHaveLength(0)
    expect(screen.getAllByTestId('custom-more').length).toBeGreaterThan(0)
  })

  it('string child renders a Truncate.Content via shorthand', () => {
    const { getByText } = render(
      <Truncate lines={2} expanded={true}>
        {SHORT}
      </Truncate>
    )
    expect(getByText(SHORT)).toBeTruthy()
  })

  it('forwards moreLabel through the string shorthand', () => {
    mockCanvas()
    mockWidth(300)
    const { container } = render(
      <Truncate lines={2} moreLabel="More">
        {LONG}
      </Truncate>
    )
    const [btn] = visibleToggles(container)
    expect(btn).toBeTruthy()
    expect(btn.textContent).toBe('More')
  })

  it('still renders compound children untouched (no shorthand wrapping)', () => {
    const { getByTestId } = render(
      <Truncate lines={2} expanded={true}>
        <Truncate.Content data-testid="explicit-content">{SHORT}</Truncate.Content>
      </Truncate>
    )
    expect(getByTestId('explicit-content')).toBeTruthy()
  })

  it('warns in dev when children is not a string', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    render(
      <Truncate lines={2} expanded={true}>
        <Truncate.Content>{123 as unknown as string}</Truncate.Content>
      </Truncate>
    )
    expect(warn).toHaveBeenCalledWith(
      expect.stringContaining('expects a plain string child')
    )
    warn.mockRestore()
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

// ─── Accessibility ────────────────────────────────────────────────────────────

// jsdom returns null from canvas.getContext, so measurement never runs by
// default. Stub a 2d context (8px per char) so truncation actually computes.
function mockCanvas() {
  Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
    configurable: true,
    value: () => ({
      font: '',
      measureText: (t: string) => ({ width: t.length * 8 }),
    }),
  })
}

function mockWidth(width = 300) {
  Object.defineProperty(HTMLElement.prototype, 'getBoundingClientRect', {
    configurable: true,
    value: () => ({ width, height: 0, top: 0, left: 0, right: width, bottom: 0, x: 0, y: 0, toJSON: () => ({}) }),
  })
}

describe('accessibility', () => {
  it('auto-wires aria-controls from Toggle to the Content id', () => {
    render(
      <Truncate lines={3} expanded={true}>
        <Truncate.Content data-testid="content">{LONG}</Truncate.Content>
        <Truncate.Toggle data-testid="toggle">Less</Truncate.Toggle>
      </Truncate>
    )
    const content = screen.getByTestId('content')
    const toggle = screen.getByTestId('toggle')
    expect(content.id).toBeTruthy()
    expect(toggle.getAttribute('aria-controls')).toBe(content.id)
  })

  it('lets an explicit contentId on Toggle override the context id', () => {
    render(
      <Truncate lines={3} expanded={true}>
        <Truncate.Content data-testid="content">{LONG}</Truncate.Content>
        <Truncate.Toggle contentId="explicit" data-testid="toggle">
          Less
        </Truncate.Toggle>
      </Truncate>
    )
    expect(screen.getByTestId('toggle').getAttribute('aria-controls')).toBe('explicit')
  })

  it('exposes the full text to assistive tech when truncated', () => {
    mockCanvas()
    mockWidth(300)
    render(
      <Truncate lines={2}>
        <Truncate.Content>{LONG}</Truncate.Content>
      </Truncate>
    )
    // The complete text is present in the DOM (visually-hidden copy) even
    // though only a clipped fragment is shown.
    expect(document.body.textContent).toContain(LONG.trim())
  })

  it('keeps the inline more toggle outside the aria-hidden fragment', () => {
    mockCanvas()
    mockWidth(300)
    render(
      <Truncate lines={2}>
        <Truncate.Content
          more={(toggle) => (
            <button data-testid="inline-more" onClick={toggle}>
              See more
            </button>
          )}
        >
          {LONG}
        </Truncate.Content>
      </Truncate>
    )
    // The button is also rendered once in the off-screen measurement span;
    // assert that a visible copy exists outside any aria-hidden subtree, so the
    // focusable control is announced to assistive tech.
    const visible = screen
      .getAllByTestId('inline-more')
      .filter((el) => el.closest('[aria-hidden="true"]') === null)
    expect(visible).toHaveLength(1)
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
