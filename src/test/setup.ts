import '@testing-library/jest-dom'
import { vi } from 'vitest'

// jsdom has no layout engine — canvas.measureText always returns 0.
// Approximate with 8px per character so binary search logic actually exercises.
vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
  measureText: (text: string) => ({ width: text.length * 8 }),
  font: '',
} as unknown as CanvasRenderingContext2D)

// ResizeObserver is not implemented in jsdom
globalThis.ResizeObserver = class ResizeObserver {
  observe() {}
  unobserve() {}
  disconnect() {}
}
