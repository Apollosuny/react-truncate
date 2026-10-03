# Contributing to @apollosuny/react-truncate

Thank you for taking the time to contribute. This document covers everything you need to get started.

---

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Project Structure](#project-structure)
- [Submitting Changes](#submitting-changes)
- [Commit Convention](#commit-convention)
- [Releasing](#releasing)

---

## Code of Conduct

Be respectful. Harassment, discrimination, or personal attacks of any kind will not be tolerated.

---

## Getting Started

**Prerequisites**

- Node.js 18+
- [pnpm](https://pnpm.io) 10+

**Setup**

```bash
git clone https://github.com/apollosuny/react-truncate.git
cd react-truncate
pnpm install
```

**Verify everything works**

```bash
pnpm typecheck   # TypeScript — should produce no errors
pnpm test        # Vitest — all tests should pass
pnpm build       # tsup — dist/ should be populated
```

---

## Development Workflow

| Command | Description |
|---|---|
| `pnpm dev` | Watch mode — rebuilds on save |
| `pnpm test` | Run tests once |
| `pnpm test:watch` | Run tests in watch mode |
| `pnpm test:coverage` | Run tests with coverage report |
| `pnpm typecheck` | TypeScript check without emitting |
| `pnpm build` | Production build via tsup |

---

## Project Structure

```
src/
├── context.ts                         # React context + useTruncateContext
├── truncate.tsx                       # <Truncate> root — state, controlled/uncontrolled
├── truncate-content.tsx               # <Truncate.Content> — canvas measurement + binary search
├── truncate-toggle.tsx                # <Truncate.Toggle> — button with asChild support
├── use-truncate.ts                    # Public hook for consumers
├── hooks/
│   └── use-isomorphic-layout-effect.ts
└── test/
    ├── setup.ts                       # Vitest globals: canvas mock, ResizeObserver stub
    └── truncate.test.tsx
```

The core algorithm lives in [src/truncate-content.tsx](src/truncate-content.tsx):

1. `ResizeObserver` fires `calcTargetWidth` on container resize
2. `canvas.measureText()` is used to measure text width at the computed font
3. Binary search (word-level for middle lines, character-level for the last line) finds the exact cutoff
4. The `more` render prop and `ellipsis` node are measured in a hidden `aria-hidden` span so they are subtracted from the available width

---

## Submitting Changes

### Bug fixes

1. Open an issue describing the bug and reproduction steps before starting work (skip if trivial)
2. Fork the repository and create a branch: `fix/short-description`
3. Add or update a test that fails before your fix and passes after
4. Submit a PR — link the issue with `Closes #123`

### New features

1. **Open an issue first** to discuss the feature before implementing
2. Implement with tests
3. Update the relevant section of `README.md`
4. Submit a PR

### Pull request checklist

- [ ] `pnpm typecheck` passes
- [ ] `pnpm test` passes
- [ ] New behaviour is covered by a test
- [ ] `README.md` updated if public API changed
- [ ] PR title follows [commit convention](#commit-convention)

---

## Commit Convention

This project follows [Conventional Commits](https://www.conventionalcommits.org):

```
<type>(<scope>): <short summary>
```

| Type | When to use |
|---|---|
| `feat` | New feature visible to consumers |
| `fix` | Bug fix |
| `perf` | Performance improvement |
| `refactor` | Internal change, no behaviour change |
| `test` | Tests only |
| `docs` | Documentation only |
| `chore` | Tooling, CI, deps |
| `build` | Build system changes |

**Examples**

```
feat(toggle): add asChild prop support
fix(content): handle single word wider than container
docs: add controlled state example to README
chore: bump vitest to 3.3
```

Breaking changes — add `!` after type:

```
feat!: rename ellipsis prop to suffix
```

---

## Releasing

Releases are published manually from a maintainer's machine. Maintainers only:

1. Update `version` in `package.json` following [semver](https://semver.org)
2. Update `CHANGELOG.md`
3. Commit: `chore: release v0.2.0`, open a PR, and merge it into `main` once CI is green
4. From an up-to-date `main`, confirm you are logged in (`npm whoami`) and publish:
   ```bash
   npm publish --access public
   ```
   `prepublishOnly` rebuilds `dist/` before packing
5. Tag the release commit and push the tag:
   ```bash
   git tag v0.2.0
   git push origin v0.2.0
   ```
