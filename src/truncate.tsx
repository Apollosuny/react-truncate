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
}

function TruncateRoot({
  children,
  lines = 3,
  expanded: controlledExpanded,
  defaultExpanded = false,
  onExpandedChange,
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
  }

  return (
    <TruncateContext.Provider value={ctx}>
      <div data-state={expanded ? 'expanded' : 'truncated'} {...props}>
        {children}
      </div>
    </TruncateContext.Provider>
  )
}

/**
 * Root component. Provides context to `Truncate.Content` and `Truncate.Toggle`.
 *
 * @example
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
