import React, { useCallback, useEffect, useRef, useState } from 'react'
import { useTruncateContext } from './context'
import { useIsomorphicLayoutEffect } from './hooks/use-isomorphic-layout-effect'

export interface TruncateContentProps extends React.HTMLAttributes<HTMLSpanElement> {
  /** The text to truncate. Must be a plain string. */
  children: string
  /**
   * Node rendered at the end of the last truncated line, before `more`.
   * @default "... "
   */
  ellipsis?: React.ReactNode
  /**
   * Inline element rendered after `ellipsis` on the last truncated line.
   * Receives the toggle function so you can wire up a clickable "see more".
   *
   * @example
   * more={(toggle) => (
   *   <button onClick={toggle} className="text-blue-500">see more</button>
   * )}
   */
  more?: (toggle: () => void) => React.ReactNode
  /**
   * Inline element rendered after the full text once expanded. Mirrors `more`,
   * keeping the collapse affordance (e.g. "see less") on the same line as the
   * text instead of dropping it onto a new line.
   *
   * @example
   * less={(toggle) => (
   *   <button onClick={toggle} className="text-blue-500">see less</button>
   * )}
   */
  less?: (toggle: () => void) => React.ReactNode
}

type LineNode = React.ReactElement | string

function cx(...args: (string | undefined | null | false)[]) {
  return args.filter(Boolean).join(' ')
}

// Visually hidden but readable by assistive tech. Inlined so the library keeps
// its zero-CSS promise (no dependency on a consumer `.sr-only` utility).
const srOnly: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  borderWidth: 0,
}

export function TruncateContent({
  children: text,
  ellipsis = '... ',
  more,
  less,
  className,
  ...props
}: TruncateContentProps) {
  const { expanded, isTruncated, lines, toggle, setIsTruncated, contentId } =
    useTruncateContext()

  const containerRef = useRef<HTMLSpanElement>(null)
  const ellipsisRef = useRef<HTMLSpanElement>(null)
  const canvasCtxRef = useRef<CanvasRenderingContext2D | null>(null)
  const letterSpacingRef = useRef(0)

  const [targetWidth, setTargetWidth] = useState(0)
  const [renderedLines, setRenderedLines] = useState<LineNode[]>([])
  const prevIsTruncatedRef = useRef<boolean | null>(null)

  // ── Read container width + initialise canvas context ──────────────
  const calcTargetWidth = useCallback(() => {
    const el = containerRef.current
    if (!el) return

    // Use the element's own width — as a display:block span it always
    // matches the parent's content area, so there's no padding to subtract.
    const w = Math.floor(el.getBoundingClientRect().width)
    if (!w) return

    const style = window.getComputedStyle(el)

    // Correct CSS font shorthand order: style weight size family
    const font = `${style.fontStyle} ${style.fontWeight} ${style.fontSize} ${style.fontFamily}`

    if (!canvasCtxRef.current) {
      const canvas = document.createElement('canvas')
      canvasCtxRef.current = canvas.getContext('2d')
    }
    if (canvasCtxRef.current) {
      canvasCtxRef.current.font = font
    }

    // canvas.measureText ignores letter-spacing — track it separately
    letterSpacingRef.current = parseFloat(style.letterSpacing) || 0

    setTargetWidth(w)
  }, [])

  // ── Mount + resize ─────────────────────────────────────────────────
  useIsomorphicLayoutEffect(() => {
    calcTargetWidth()
    const el = containerRef.current
    if (!el) return
    const ro = new ResizeObserver(calcTargetWidth)
    ro.observe(el)

    // Web fonts can resolve after the first measurement, which would change
    // glyph metrics and shift the cutoff. Re-measure once they're ready.
    let cancelled = false
    const fonts = typeof document !== 'undefined' ? document.fonts : undefined
    fonts?.ready
      .then(() => {
        if (!cancelled) calcTargetWidth()
      })
      .catch(() => {})

    return () => {
      cancelled = true
      ro.disconnect()
    }
  }, [calcTargetWidth, text])

  // Measure text width via canvas + letter-spacing compensation
  const measureWidth = useCallback((t: string) => {
    const raw = canvasCtxRef.current?.measureText(t).width ?? 0
    return raw + t.length * letterSpacingRef.current
  }, [])

  // ── Build truncated lines ──────────────────────────────────────────
  useEffect(() => {
    if (expanded || !targetWidth || !canvasCtxRef.current) return

    // Off-screen span is no longer clipped so getBoundingClientRect is reliable
    const ellipsisW = ellipsisRef.current?.getBoundingClientRect().width ?? 0
    const result: LineNode[] = []
    const textLines = text.split('\n').map((l) => l.split(' '))
    let didTruncate = true

    outer: for (let line = 1; line <= lines; line++) {
      const words = textLines[0]

      // Blank line from \n
      if (!words || words.length === 0) {
        result.push(<br key={`br-${line}`} />)
        textLines.shift()
        line--
        continue
      }

      const fullLineText = words.join(' ')

      // Entire remaining text fits — no truncation needed
      if (measureWidth(fullLineText) <= targetWidth && textLines.length === 1) {
        didTruncate = false
        result.push(<span key={line}>{fullLineText}</span>)
        break outer
      }

      if (line === lines) {
        // Last visible line — binary search by character
        let lo = 0
        let hi = fullLineText.length - 1

        while (lo <= hi) {
          const mid = Math.floor((lo + hi) / 2)
          if (measureWidth(fullLineText.slice(0, mid + 1)) + ellipsisW <= targetWidth) {
            lo = mid + 1
          } else {
            hi = mid - 1
          }
        }

        const clipped = fullLineText.slice(0, lo).replace(/\s+$/, '')
        result.push(
          <span key={line}>
            {clipped}
            {ellipsis}
          </span>
        )
      } else {
        // Middle line — binary search by word
        let lo = 0
        let hi = words.length - 1

        while (lo <= hi) {
          const mid = Math.floor((lo + hi) / 2)
          if (measureWidth(words.slice(0, mid + 1).join(' ')) <= targetWidth) {
            lo = mid + 1
          } else {
            hi = mid - 1
          }
        }

        // Single word wider than container — jump to last-line logic
        if (lo === 0) {
          line = lines - 1
          continue
        }

        result.push(<span key={line}>{words.slice(0, lo).join(' ')}</span>)
        textLines[0].splice(0, lo)
      }
    }

    setRenderedLines(result)

    if (didTruncate !== prevIsTruncatedRef.current) {
      prevIsTruncatedRef.current = didTruncate
      setIsTruncated(didTruncate)
    }
    // `more` is intentionally excluded: it's rendered outside the measured
    // lines now, and consumers pass a fresh closure each render. The combined
    // ellipsis + more width is still measured live from the DOM via `ellipsisRef`.
  }, [targetWidth, text, lines, expanded, measureWidth, ellipsis, setIsTruncated])

  // Visible truncated lines, joined inline with <br> so the toggle can sit at
  // the end of the last line instead of dropping to a new row.
  const lineRun = renderedLines.map((node, i, arr) =>
    i === arr.length - 1 ? (
      node
    ) : (
      <span key={`wrap-${i}`}>
        {node}
        <br />
      </span>
    )
  )

  const measured = targetWidth > 0 && renderedLines.length > 0

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <span
      ref={containerRef}
      id={contentId}
      className={cx('block', className)}
      style={{ display: 'block' }}
      {...props}
    >
      {expanded ? (
        <>
          {text}
          {less && (
            <>
              {' '}
              {less(toggle)}
            </>
          )}
        </>
      ) : (
        <>
          {measured && isTruncated ? (
            <>
              {/*
               * Full text for assistive tech. The visible clipped fragment
               * below is a broken sentence, so it's hidden from the a11y tree
               * and the complete text is exposed here instead.
               */}
              <span style={srOnly}>{text}</span>
              <span aria-hidden="true">{lineRun}</span>
              {/* Inline toggle — kept outside the aria-hidden fragment so it
                  remains focusable and announced. */}
              {more?.(toggle)}
            </>
          ) : (
            <span style={{ display: 'block' }}>{measured ? lineRun : text}</span>
          )}

          {/*
           * Off-screen span used to measure the combined width of
           * ellipsis + more button before layout runs.
           * Must NOT be clipped (no overflow:hidden + width:0) so that
           * getBoundingClientRect() returns the true rendered width.
           */}
          <span
            aria-hidden
            style={{
              position: 'absolute',
              top: 0,
              left: '-9999px',
              visibility: 'hidden',
              pointerEvents: 'none',
              whiteSpace: 'nowrap',
            }}
          >
            <span ref={ellipsisRef} style={{ display: 'inline-block' }}>
              {ellipsis}
              {more?.(toggle)}
            </span>
          </span>
        </>
      )}
    </span>
  )
}
