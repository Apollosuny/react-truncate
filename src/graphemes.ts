/**
 * Split a string into grapheme clusters (user-perceived characters) so the
 * per-character binary search in the truncation engine never cuts through the
 * middle of an emoji, regional-indicator flag, ZWJ sequence, or a base
 * character followed by combining marks.
 *
 * Uses `Intl.Segmenter` (Baseline across modern browsers) when available and
 * falls back to code-point iteration otherwise — the fallback still keeps
 * surrogate pairs intact (so astral-plane emoji never split); only rarer
 * combining sequences may break under it.
 */

let segmenter: Intl.Segmenter | null | undefined

function getSegmenter(): Intl.Segmenter | null {
  if (segmenter === undefined) {
    segmenter =
      typeof Intl !== 'undefined' && typeof Intl.Segmenter === 'function'
        ? new Intl.Segmenter(undefined, { granularity: 'grapheme' })
        : null
  }
  return segmenter
}

export function toGraphemes(value: string): string[] {
  const seg = getSegmenter()
  if (!seg) return Array.from(value)

  const result: string[] = []
  for (const { segment } of seg.segment(value)) result.push(segment)
  return result
}
