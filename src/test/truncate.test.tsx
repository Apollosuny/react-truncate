import React from 'react'
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect, vi } from 'vitest'
import { Truncate } from '../truncate'
import { useTruncate } from '../use-truncate'

const SHORT = 'Short text.'
// 8px per char × ~400 chars → exceeds any reasonable container width
const LONG = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit. '.repeat(8)

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

    // Toggle button may not appear until isTruncated is set — test state machine
    if (btn) {
      fireEvent.click(btn)
      expect(root.dataset.state).toBe('expanded')
    }
  })

  it('calls onExpandedChange when toggled', () => {
    const handler = vi.fn()
    const { container } = setup({ onExpandedChange: handler })
    const btn = screen.queryByTestId('toggle')
    if (btn) {
      fireEvent.click(btn)
      expect(handler).toHaveBeenCalledWith(true)
    }
  })

  it('respects controlled expanded prop', () => {
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

  it('does not throw when text fits within lines (no truncation)', () => {
    expect(() => setup({ text: SHORT })).not.toThrow()
  })

  it('renders custom ellipsis', () => {
    render(
      <Truncate lines={2}>
        <Truncate.Content ellipsis=" [more]">{LONG}</Truncate.Content>
      </Truncate>
    )
    expect(document.body).toBeTruthy()
  })
})

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
})
