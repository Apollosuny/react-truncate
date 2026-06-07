import React, { useCallback, useId, useState } from 'react'
import { TruncateContext, type TruncateContextValue } from './context'
import { TruncateContent } from './truncate-content'
import { TruncateToggle } from './truncate-toggle'

export interface TruncateProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Maximum number of visible lines before truncation. @default 3 */
  lines?: number
  /** Controlled expanded state. */
  expanded?: boolean
  /** Initial expanded state for uncontrolled usage. @default false */
  defaultExpanded?: boolean
  /** Called when the expanded state changes. */
  onExpandedChange?: (expanded: boolean) => void
  /**
   * Shorthand mode: when `children` is a plain string, the root renders a
   * `<Truncate.Content>` for you and forwards this `ellipsis`. Ignored when you
   * pass `<Truncate.Content>` / `<Truncate.Toggle>` children explicitly.
   */
  ellipsis?: React.ReactNode
  /** Shorthand-mode `moreLabel`, forwarded to the auto-rendered content. */
  moreLabel?: React.ReactNode
  /** Shorthand-mode `lessLabel`, forwarded to the auto-rendered content. */
  lessLabel?: React.ReactNode
}

function TruncateRoot({
  children,
  lines = 3,
  expanded: controlledExpanded,
  defaultExpanded = false,
  onExpandedChange,
  ellipsis,
  moreLabel,
  lessLabel,
  ...props
}: TruncateProps) {
  const [internalExpanded, setInternalExpanded] = useState(defaultExpanded)
  const [isTruncated, setIsTruncated] = useState(false)
  const contentId = useId()

  const isControlled = controlledExpanded !== undefined
  const expanded = isControlled ? controlledExpanded : internalExpanded

  const toggle = useCallback(() => {
    const next = !expanded
    if (!isControlled) setInternalExpanded(next)
    onExpandedChange?.(next)
  }, [expanded, isControlled, onExpandedChange])

  const ctx: TruncateContextValue = {
    expanded,
    isTruncated,
    lines,
    toggle,
    setIsTruncated,
    contentId,
  }

  // Shorthand: a bare string child becomes a `<Truncate.Content>` so the
  // simplest case is a one-liner. Element children (the compound API) pass
  // through untouched.
  const content =
    typeof children === 'string' ? (
      <TruncateContent ellipsis={ellipsis} moreLabel={moreLabel} lessLabel={lessLabel}>
        {children}
      </TruncateContent>
    ) : (
      children
    )

  return (
    <TruncateContext.Provider value={ctx}>
      <div data-state={expanded ? 'expanded' : 'truncated'} {...props}>
        {content}
      </div>
    </TruncateContext.Provider>
  )
}

/**
 * Root component. Provides context to `Truncate.Content` and `Truncate.Toggle`.
 *
 * @example
 * // Shorthand — string child + labels
 * <Truncate lines={3} moreLabel="See more" lessLabel="See less">
 *   {longText}
 * </Truncate>
 *
 * @example
 * // Compound API — full control
 * <Truncate lines={3}>
 *   <Truncate.Content ellipsis="... ">
 *     {longText}
 *   </Truncate.Content>
 *   <Truncate.Toggle>
 *     {({ expanded }) => (expanded ? 'See less' : 'See more')}
 *   </Truncate.Toggle>
 * </Truncate>
 */
export const Truncate = Object.assign(TruncateRoot, {
  Content: TruncateContent,
  Toggle: TruncateToggle,
})
