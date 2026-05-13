import React, { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react'
import { Truncate } from '../truncate'

const LONG =
  'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.'

const SHORT = 'Short text that fits in a single line without any truncation.'

// Shared inline toggle style — mimics Facebook's "See more" link
const seeMoreStyle: React.CSSProperties = {
  color: '#1877f2',
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 'inherit',
  fontFamily: 'inherit',
}

// Shared "See less" block toggle
const seeLessStyle: React.CSSProperties = {
  display: 'block',
  marginTop: 4,
  color: '#1877f2',
  background: 'none',
  border: 'none',
  padding: 0,
  cursor: 'pointer',
  fontWeight: 600,
  fontSize: 'inherit',
  fontFamily: 'inherit',
}

const meta: Meta<typeof Truncate> = {
  title: 'Components/Truncate',
  component: Truncate,
  parameters: { layout: 'padded' },
  decorators: [
    (Story) => (
      <div style={{ width: '100%', fontFamily: 'system-ui, sans-serif', fontSize: 14, lineHeight: 1.5, color: '#1c1e21' }}>
        <Story />
      </div>
    ),
  ],
}

export default meta
type Story = StoryObj<typeof Truncate>

// ─── Facebook-style inline ─────────────────────────────────────────────────
// "See more" lives at the end of the last truncated line (inline).
// "See less" appears below the full text after expanding.

export const FacebookStyle: Story = {
  name: 'Facebook-style — inline See more',
  render: () => (
    <Truncate lines={3}>
      <Truncate.Content
        ellipsis="... "
        more={(toggle) => (
          <button style={seeMoreStyle} onClick={toggle}>
            See more
          </button>
        )}
      >
        {LONG}
      </Truncate.Content>
      {/* Only shows when expanded — the inline `more` handles the collapsed state */}
      <Truncate.Toggle style={seeLessStyle}>
        {({ expanded }) => (expanded ? 'See less' : null)}
      </Truncate.Toggle>
    </Truncate>
  ),
}

export const TwoLines: Story = {
  name: '2 lines',
  render: () => (
    <Truncate lines={2}>
      <Truncate.Content
        ellipsis="... "
        more={(toggle) => (
          <button style={seeMoreStyle} onClick={toggle}>
            See more
          </button>
        )}
      >
        {LONG}
      </Truncate.Content>
      <Truncate.Toggle style={seeLessStyle}>
        {({ expanded }) => (expanded ? 'See less' : null)}
      </Truncate.Toggle>
    </Truncate>
  ),
}

export const ShortTextNoToggle: Story = {
  name: 'Short text — no toggle rendered',
  render: () => (
    <Truncate lines={3}>
      <Truncate.Content
        more={(toggle) => (
          <button style={seeMoreStyle} onClick={toggle}>
            See more
          </button>
        )}
      >
        {SHORT}
      </Truncate.Content>
      <Truncate.Toggle style={seeLessStyle}>
        {({ expanded }) => (expanded ? 'See less' : null)}
      </Truncate.Toggle>
    </Truncate>
  ),
}

// ─── Custom ellipsis ───────────────────────────────────────────────────────

export const CustomEllipsis: Story = {
  name: 'Custom ellipsis string',
  render: () => (
    <Truncate lines={3}>
      <Truncate.Content
        ellipsis=" "
        more={(toggle) => (
          <button style={seeMoreStyle} onClick={toggle}>
            [xem thêm]
          </button>
        )}
      >
        {LONG}
      </Truncate.Content>
      <Truncate.Toggle style={seeLessStyle}>
        {({ expanded }) => (expanded ? '[thu gọn]' : null)}
      </Truncate.Toggle>
    </Truncate>
  ),
}

// ─── Controlled ────────────────────────────────────────────────────────────

export const Controlled: Story = {
  name: 'Controlled expanded state',
  render: () => {
    const [expanded, setExpanded] = useState(false)
    return (
      <div>
        <p style={{ marginBottom: 8, color: '#666', fontSize: 12 }}>
          External state: <strong>{expanded ? 'expanded' : 'collapsed'}</strong>
        </p>
        <button
          onClick={() => setExpanded((v) => !v)}
          style={{ marginBottom: 12, padding: '4px 12px', cursor: 'pointer' }}
        >
          Toggle from outside
        </button>
        <Truncate lines={3} expanded={expanded} onExpandedChange={setExpanded}>
          <Truncate.Content
            ellipsis="... "
            more={(toggle) => (
              <button style={seeMoreStyle} onClick={toggle}>
                See more
              </button>
            )}
          >
            {LONG}
          </Truncate.Content>
          <Truncate.Toggle style={seeLessStyle}>
            {({ expanded: exp }) => (exp ? 'See less' : null)}
          </Truncate.Toggle>
        </Truncate>
      </div>
    )
  },
}

// ─── asChild ──────────────────────────────────────────────────────────────

export const AsChild: Story = {
  name: 'Toggle asChild (<a> tag)',
  render: () => (
    <Truncate lines={3}>
      <Truncate.Content
        ellipsis="... "
        more={(toggle) => (
          <button style={seeMoreStyle} onClick={toggle}>
            See more
          </button>
        )}
      >
        {LONG}
      </Truncate.Content>
      <Truncate.Toggle asChild>
        {({ expanded }) =>
          expanded ? (
            // eslint-disable-next-line jsx-a11y/anchor-is-valid
            <a href="#" style={{ ...seeLessStyle, display: 'block', marginTop: 4 }}>
              See less
            </a>
          ) : null
        }
      </Truncate.Toggle>
    </Truncate>
  ),
}

// ─── data-state styling ────────────────────────────────────────────────────

export const DataStateStyling: Story = {
  name: 'data-state CSS styling',
  render: () => (
    <>
      <style>{`
        .demo[data-state="truncated"] { border-left: 3px solid #f97316; padding-left: 10px; }
        .demo[data-state="expanded"]  { border-left: 3px solid #22c55e; padding-left: 10px; }
      `}</style>
      <Truncate lines={3} className="demo">
        <Truncate.Content
          ellipsis="... "
          more={(toggle) => (
            <button style={seeMoreStyle} onClick={toggle}>See more</button>
          )}
        >
          {LONG}
        </Truncate.Content>
        <Truncate.Toggle style={seeLessStyle}>
          {({ expanded }) => (expanded ? 'See less' : null)}
        </Truncate.Toggle>
      </Truncate>
    </>
  ),
}
