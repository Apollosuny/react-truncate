import React from 'react'
import { Slot } from './slot'
import { useTruncateContext } from './context'

type RenderFn = (state: { expanded: boolean }) => React.ReactNode

export interface TruncateToggleProps
  extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, 'children'> {
  /**
   * Render as a child element instead of a `<button>`.
   * The child must forward refs and accept `onClick`, `aria-expanded`, `aria-controls`.
   */
  asChild?: boolean
  /**
   * Either a static node or a render-prop receiving `{ expanded }`.
   *
   * @example
   * {({ expanded }) => expanded ? 'Show less' : 'Show more'}
   */
  children: React.ReactNode | RenderFn
  /**
   * `id` of the content region this button controls. Used for `aria-controls`.
   * Wired up automatically when using `<Truncate.Content>`.
   */
  contentId?: string
}

export function TruncateToggle({
  asChild = false,
  children,
  contentId,
  ...props
}: TruncateToggleProps) {
  const { expanded, isTruncated, toggle, contentId: ctxContentId } = useTruncateContext()

  // Hide when there is nothing to toggle
  if (!isTruncated && !expanded) return null

  const Comp = asChild ? Slot : 'button'
  const resolved = typeof children === 'function' ? (children as RenderFn)({ expanded }) : children

  return (
    <Comp
      type={asChild ? undefined : 'button'}
      aria-expanded={expanded}
      aria-controls={contentId ?? ctxContentId}
      onClick={toggle}
      {...props}
    >
      {resolved}
    </Comp>
  )
}
