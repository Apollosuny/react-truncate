import { useTruncateContext } from './context'

/**
 * Access the truncate state from any component inside `<Truncate>`.
 *
 * @example
 * function MyToggle() {
 *   const { expanded, isTruncated, toggle } = useTruncate()
 *   if (!isTruncated) return null
 *   return <button onClick={toggle}>{expanded ? 'Less' : 'More'}</button>
 * }
 */
export function useTruncate() {
  const { expanded, isTruncated, lines, toggle } = useTruncateContext()
  return { expanded, isTruncated, lines, toggle }
}
