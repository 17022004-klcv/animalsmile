<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AnimalSmile

Animal shelter management app (Next.js 16.4 App Router, React 19, Prisma 7 + PostgreSQL, Tailwind 4). Single package, not a monorepo. Package manager is **pnpm** (`packageManager: pnpm@11.20.0`) — do not use npm/yarn. Root `README.md` is stale `create-next-app` boilerplate; trust `package.json` and this file.

## Commands

- `pnpm dev` — dev server (Turbopack; also regenerates the agent-rules block above)
- `pnpm build` — production build; also runs the full typecheck
- `npx tsc --noEmit` — typecheck only (~20s; no dedicated script)
- `npx eslint <path>` — scoped lint while iterating; `pnpm lint` lints everything and **takes minutes**. Warnings don't fail the run; errors do.
- `pnpm prisma:seed` (alias `pnpm db:seed`) — upserts the admin user (`ADMIN_EMAIL`/`ADMIN_PASSWORD`/`ADMIN_NOMBRE`/`ADMIN_APELLIDO`; defaults `admin@animalsmile.org` / `Admin12345`) plus the medical catalogs (vaccines, medications, diseases).
- `pnpm prisma generate` — regenerate the client (also runs via `postinstall`).
- First run: fill `.env`, `pnpm install`, `pnpm prisma migrate dev`, `pnpm prisma:seed`, then `pnpm dev`.

There is no test suite or CI (no `.github/`). Verify changes with `npx tsc --noEmit` and scoped ESLint.

## Layering — follow this for any feature

Per-domain code lives in `src/services/<domain>/` with `src/types/` for shared types:

- `*-validation.ts` — hand-written parse/normalize functions returning `ResultadoParseo<T>` (`{ ok: true, valor }` | `{ ok: false, error }`) from `src/types/common.ts`. There is no zod/validation library; don't add one.
- `*-server.ts` — Prisma access and business rules. Throws `ErrorServicio` and maps Prisma error codes through `mapearErrorPrisma` (`src/services/common/errors.ts`).
- `*-client.ts` — browser fetch wrappers built on `pedir` (`src/services/common/http.ts`); it throws an `Error` carrying the server's Spanish message.
- `*-format.ts` — display formatting where present.
- `src/types/` — domain types/enums; `src/types/index.ts` re-exports them.

API routes under `src/app/api/admin/**` are thin: `getSession()` + role check → validation parse → call `*-server` → return JSON, converting `ErrorServicio` to its status. Admin pages are client components (`"use client"`) that call `*-client` functions, not Prisma directly.

Service folder names do not always mirror route/module names — e.g. `solicitudes` powers `adoptions/applications` and `applicants` powers `adoptions/applicants`. Reuse the existing service rather than adding a matching-name folder.

## Prisma (v7 specifics)

- Schema: `prisma/schema.prisma`; migrations: `prisma/migrations`; config: `prisma.config.ts` (loads `.env` itself via dotenv — plain `prisma` CLI commands work).
- Client is generated to `src/generated/prisma` (**gitignored**). Import `PrismaClient` from `@/src/generated/prisma/client` and enums from `@/src/generated/prisma/enums`; never from `@prisma/client`. After a fresh checkout or schema change, run `pnpm prisma generate` before building.
- Prisma 7 uses a driver adapter: always get the client via `src/lib/prisma.ts` (`PrismaPg` + `DATABASE_URL`). Do not instantiate `PrismaClient` in app code (`prisma/seed.ts` is the only exception).
- Datasource is PostgreSQL. Apply migrations with `prisma migrate` commands.
- Prisma fields/columns are snake_case (`id_usuario`, `password_hash`), while models are PascalCase and enums/values are Spanish — use the generated names exactly.

## Auth (custom, not NextAuth)

- HMAC-signed cookie session (`as_session`), token logic in `src/lib/session.ts`, cookie helpers + audit logging in `src/lib/auth.ts`. Requires `AUTH_SECRET` env var.
- Route protection lives in `src/proxy.ts` — **Next 16 renamed Middleware to Proxy** (`proxy.ts` next to `app/`, named `proxy` export). It only guards page paths `/admin` (redirects non-`Administrador` sessions to `/login?redirect=…`). **It does not cover `/api/*`** — every admin API handler must repeat the check itself: `getSession()` + `rol === "Administrador"`, else `401 {"error":"No autorizado."}` (pattern in `src/app/api/admin/**`). Server-side checks use `getSession()` from `@/src/lib/auth`.
- API routes: `src/app/api/auth/{login,register,logout,me}` and admin domains `adoptions`, `animals`, `classifications`, `donations`, `inquiries`, `medical`, `sanctuaries`, `upload`, `users`. Failed logins are recorded in `BitacoraAcceso` via `registrarAcceso`.
- File uploads: `POST /api/admin/upload` writes images (≤5 MB) to `public/uploads/animals/` and returns `/uploads/animals/<uuid>` URLs.

## Structure & conventions

- Routes: `src/app/(auth)/` (login/register), `src/app/(client)/` (public site, `/`), `src/app/admin/` (admin panel, with `admin/modules/<Module>/<Subpage>/page.tsx`), shared `layout.tsx` at `src/app/`.
- Path alias `@/*` maps to the **repo root** (e.g. `@/src/lib/prisma`), not to `src/`.
- The domain is Spanish: Prisma models/enums (`Usuario`, `RolUsuario`, `SolicitudAdopcion`…), user-facing error messages, and comments. **Exception:** directory and URL segments are English (`admin/modules/Adoption/…`, `/api/admin/classifications/species`). Match the surrounding layer, don't translate one into the other.
- Tailwind 4 is wired through a Turbopack rule in `next.config.ts` (`@tailwindcss/turbopack` loader); there is no `tailwind.config`. Page-specific CSS lives beside pages (e.g. `panda-login.css`, `puppy-register.css`). Theming goes through `src/context/ThemeContext.tsx`.
- `next.config.ts` enables `cacheComponents`, `partialPrefetching`, and `experimental.agentFeedback` — check `node_modules/next/dist/docs/` before assuming route/caching semantics.

## Gotchas

- `.env` (with `DATABASE_URL`, `AUTH_SECRET`) is gitignored and required for dev, seed, and migrations. `prisma.config.ts` also checks for a `.env` in the parent directory.
- `pnpm-workspace.yaml` sets `allowBuilds` to block postinstall builds for esbuild/sharp/workerd/unrs-resolver — don't "fix" missing native binaries by enabling them without need.
- The seed skips vaccine catalog rows when the matching `Especie`/`Taxonomia` names are not already in the DB (it logs a warning and continues).
- `.gitignore` ignores `*.md`, so newly created docs will not appear in `git status` unless force-added. This tracked file still updates normally.
- Don't delete or rewrite the `nextjs-agent-rules` block at the top; `next dev` re-adds it.
