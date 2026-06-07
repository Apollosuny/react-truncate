import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/index.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
  external: ['react', 'react-dom'],
  treeshake: true,
  // The components rely on canvas + ResizeObserver, so the whole package is a
  // client boundary. The directive lets consumers drop `<Truncate>` straight
  // into a React Server Component (Next.js App Router) without wrapping it.
  // It is prepended post-build because tsup's `treeshake` (rollup) strips a
  // `banner`-injected directive. Harmless in the CJS build / non-RSC bundlers.
  onSuccess: 'node scripts/prepend-use-client.mjs',
})
