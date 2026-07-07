import React from 'react'

/**
 * Minimal `asChild` slot: merges the slot's props onto a single child element
 * instead of rendering a wrapper. Replaces `@radix-ui/react-slot` so the
 * package ships with zero runtime dependencies.
 *
 * Merge rules (matching the `asChild` convention):
 * - The child's own props win for plain values (e.g. `href`, `type`).
 * - Event handlers (`onClick`, …) are composed: the child's runs first, then
 *   the slot's.
 * - `className` is concatenated and `style` is shallow-merged, slot first so
 *   the child can override individual declarations.
 *
 * We deliberately do not forward a ref here: nothing in this package attaches a
 * ref to the slot, and `cloneElement` preserves whatever ref the consumer put
 * on their own child element.
 */
export interface SlotProps extends React.HTMLAttributes<HTMLElement> {
  children?: React.ReactNode
}

type UnknownProps = Record<string, unknown>

function isEventHandlerName(key: string): boolean {
  return /^on[A-Z]/.test(key)
}

export function Slot({ children, ...slotProps }: SlotProps) {
  if (!React.isValidElement(children)) {
    // Best-effort fallback for misuse (e.g. a string child): render as-is
    // rather than throwing, keeping the component resilient.
    return <>{children}</>
  }

  const childProps = (children.props ?? {}) as UnknownProps
  const merged: UnknownProps = { ...(slotProps as UnknownProps), ...childProps }

  for (const key of Object.keys(slotProps)) {
    const slotValue = (slotProps as UnknownProps)[key]
    const childValue = childProps[key]

    if (isEventHandlerName(key) && typeof slotValue === 'function') {
      const slotHandler = slotValue as (...args: unknown[]) => void
      const childHandler =
        typeof childValue === 'function'
          ? (childValue as (...args: unknown[]) => void)
          : undefined
      merged[key] = childHandler
        ? (...args: unknown[]) => {
            childHandler(...args)
            slotHandler(...args)
          }
        : slotHandler
    }
  }

  const slotClassName = (slotProps as UnknownProps).className as string | undefined
  const childClassName = childProps.className as string | undefined
  if (slotClassName || childClassName) {
    merged.className = [slotClassName, childClassName].filter(Boolean).join(' ')
  }

  const slotStyle = (slotProps as UnknownProps).style as React.CSSProperties | undefined
  const childStyle = childProps.style as React.CSSProperties | undefined
  if (slotStyle || childStyle) {
    merged.style = { ...slotStyle, ...childStyle }
  }

  return React.cloneElement(children, merged)
}
