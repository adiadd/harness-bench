# AGENTS.md

Instructions for AI coding agents operating in this repository.

## Project Overview

Turborepo monorepo with a Next.js 16 web app and shared packages, using **Bun** as the
package manager and **shadcn/ui** (radix-nova style) for the component library.

**Stack:** Next.js 16 (App Router), React 19, TypeScript 5.9, Tailwind CSS v4, Radix UI, CVA

## Monorepo Structure

```
apps/web/                   — Next.js app (App Router, Turbopack dev server)
packages/ui/                — Shared UI component library (@workspace/ui)
packages/eslint-config/     — Shared ESLint flat configs
packages/typescript-config/ — Shared tsconfig base files
```

## Commands

All commands use **Bun** — never use npm/yarn/pnpm.

```bash
bun install                # Install all dependencies
bun run build              # Build all apps/packages via Turborepo
bun run lint               # Lint all apps/packages via Turborepo
bun run dev                # Start dev server (all apps, Turbopack)
bun run format             # Format with Prettier (ts, tsx, md files)
```

### Per-workspace commands

```bash
bun run --cwd apps/web lint        # Lint web app only
bun run --cwd apps/web lint:fix    # Lint and auto-fix web app
bun run --cwd apps/web typecheck   # Type-check web app (tsc --noEmit)
bun run --cwd apps/web build       # Build web app only
bun run --cwd packages/ui lint     # Lint UI package (--max-warnings 0)
```

### Tests

No test framework is configured yet. When tests are added, update this section.

### Verification after changes

Run these checks before considering work complete:

```bash
bun run --cwd apps/web typecheck   # Must pass with no errors
bun run --cwd apps/web lint        # Must pass
bun run --cwd packages/ui lint     # Must pass (zero warnings)
bun run build                      # Must succeed
```

## Code Style Guidelines

### Formatting

- **No semicolons** — the codebase omits semicolons everywhere; match existing code
- **Double quotes** for all string literals and imports
- **2-space indentation**
- Run `bun run format` before committing

### TypeScript

- **Strict mode** — `strict: true` in base tsconfig
- `noUncheckedIndexedAccess: true` — index access returns `T | undefined`, always handle it
- `isolatedModules: true` — every file must be independently parseable
- Next.js app uses `"module": "ESNext"` / `"moduleResolution": "Bundler"`
- All packages use `"type": "module"` (ESM)
- Use `React.ComponentProps<"element">` for extending HTML element props
- Use `Readonly<{ ... }>` for component children prop types
- Use `type` keyword for type-only imports: `import { type VariantProps }`

### Imports

Follow this order:

1. React / framework imports (`react`, `next/*`)
2. External libraries (`class-variance-authority`, `radix-ui`, `next-themes`)
3. Workspace packages (`@workspace/ui/*`)
4. Local alias imports (`@/*`)
5. Relative imports

```tsx
import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@workspace/ui/lib/utils";
import { Button } from "@workspace/ui/components/button";

import { Providers } from "@/components/providers";
```

**Key import paths:**

- UI components: `@workspace/ui/components/<name>`
- UI utilities: `@workspace/ui/lib/utils` (provides `cn()`)
- UI hooks: `@workspace/ui/hooks/<name>`
- Global styles: `@workspace/ui/globals.css`
- App-local files: `@/*` alias (resolves to `apps/web/*`)

### Naming Conventions

- **Files:** kebab-case (`button.tsx`, `use-theme.ts`)
- **Components:** PascalCase (`Button`, `ThemeProvider`)
- **Functions/variables:** camelCase (`buttonVariants`, `fontSans`)
- **CSS variables:** kebab-case with `--` prefix (`--primary-foreground`)
- **Exported variants:** camelCase const + `cva()` (`buttonVariants`)

### Component Patterns

- Use `function` declarations for components (not arrow functions)
- Default to React Server Components — only add `"use client"` when needed
- Use `data-slot` attributes on root elements for styling hooks
- Spread remaining props with `...props`
- Use `asChild` + `Slot.Root` from `radix-ui` for polymorphic components
- Use CVA (`class-variance-authority`) for component variants

```tsx
"use client"; // Only if needed

import * as React from "react";
import { cn } from "@workspace/ui/lib/utils";

export function MyComponent({
  className,
  children,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="my-component"
      className={cn("base-classes", className)}
      {...props}
    >
      {children}
    </div>
  );
}
```

### Styling

- **Tailwind CSS v4** — configured via CSS (`globals.css`), no `tailwind.config` file
- Use `cn()` from `@workspace/ui/lib/utils` to merge class names (clsx + tailwind-merge)
- CSS custom properties for theming (`--primary`, `--background`, etc.)
- Dark mode via `.dark` class (managed by `next-themes`)
- Tailwind v4 `@theme inline` block in `globals.css` defines design tokens

### Error Handling

- TypeScript strict mode catches most type errors at compile time
- Always handle `undefined` from indexed access (`noUncheckedIndexedAccess`)
- Validate external/untrusted data with `zod` (available in `@workspace/ui` deps)

### ESLint

- **Flat config** (ESLint 9) in `apps/web` and `packages/ui`
- `eslint-plugin-only-warn` — all lint issues are warnings (not errors)
- `@next/eslint-plugin-next` with core-web-vitals rules for the web app
- `react/react-in-jsx-scope: off` and `react/prop-types: off`
- UI package lint uses `--max-warnings 0` (zero tolerance for warnings)

## Adding shadcn/ui Components

```bash
bunx shadcn@latest add <component> -c apps/web
```

Components go to `packages/ui/src/components/` and are available to all apps
via `@workspace/ui/components/<name>`.

## Key Files

| Purpose                     | Path                                     |
| --------------------------- | ---------------------------------------- |
| Global CSS / Tailwind theme | `packages/ui/src/styles/globals.css`     |
| UI utility (`cn`)           | `packages/ui/src/lib/utils.ts`           |
| App layout                  | `apps/web/app/layout.tsx`                |
| shadcn config               | `apps/web/components.json`               |
| Turbo pipeline              | `turbo.json`                             |
| Base tsconfig               | `packages/typescript-config/base.json`   |
| Next.js tsconfig            | `packages/typescript-config/nextjs.json` |
| ESLint base                 | `packages/eslint-config/base.js`         |
| ESLint Next.js              | `packages/eslint-config/next.js`         |
