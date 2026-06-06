import { createContext, useContext } from 'react'

export interface TruncateContextValue {
  expanded: boolean
  isTruncated: boolean
  lines: number
  toggle: () => void
  setIsTruncated: (value: boolean) => void
  /** Stable id of the content region, used to wire `aria-controls`. */
  contentId: string
}

export const TruncateContext = createContext<TruncateContextValue | null>(null)

export function useTruncateContext(): TruncateContextValue {
  const ctx = useContext(TruncateContext)
  if (!ctx) {
    throw new Error(
      'Truncate sub-components must be rendered inside a <Truncate> root.'
    )
  }
  return ctx
}
