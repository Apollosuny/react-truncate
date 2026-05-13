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
}

type LineNode = React.ReactElement | string

function cx(...args: (string | undefined | null | false)[]) {
  return args.filter(Boolean).join(' ')
}

export function TruncateContent({
  children: text,
  ellipsis = '... ',
  more,
  className,
  ...props
}: TruncateContentProps) {
  const { expanded, lines, toggle, setIsTruncated } = useTruncateContext()

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
    return () => ro.disconnect()
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
            {more?.(toggle)}
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
  }, [targetWidth, text, lines, expanded, measureWidth, ellipsis, more, toggle, setIsTruncated])

  // ── Render ─────────────────────────────────────────────────────────
  return (
    <span
      ref={containerRef}
      className={cx('block', className)}
      style={{ display: 'block' }}
      {...props}
    >
      {expanded ? (
        text
      ) : (
        <>
          <span style={{ display: 'block' }}>
            {targetWidth > 0
              ? renderedLines.map((node, i, arr) =>
                  i === arr.length - 1 ? (
                    node
                  ) : (
                    <span key={`wrap-${i}`}>
                      {node}
                      <br />
                    </span>
                  )
                )
              : text}
          </span>

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
