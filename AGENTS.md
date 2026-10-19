<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# AnimalSmile

Animal shelter management app (Next.js 16.4 App Router, React 19, Prisma 7 + PostgreSQL, Tailwind 4). Single package, not a monorepo. Package manager is **pnpm** (`packageManager: pnpm@11.20.0`) — do not use npm/yarn.

## Commands

- `pnpm dev` — dev server (Turbopack; also regenerates the agent-rules block above)
- `pnpm lint` — ESLint (flat config `eslint.config.mjs`)
- `npx tsc --noEmit` — typecheck (no dedicated script; `pnpm build` also typechecks)
- `pnpm prisma:seed` — seed admin user (`ADMIN_EMAIL`/`ADMIN_PASSWORD` env, defaults `admin@animalsmile.org` / `Admin12345`)
- `pnpm postinstall` runs `prisma generate`

There is no test suite or CI.

## Prisma (v7 specifics)

- Schema: `prisma/schema.prisma`; migrations: `prisma/migrations`; config: `prisma.config.ts` (loads `.env` itself via dotenv — plain `prisma` CLI commands work).
- Client is generated to `src/generated/prisma` (**gitignored**). Import from `@/src/generated/prisma/client`, never from `@prisma/client`. After a fresh checkout or schema change, run `pnpm prisma generate` before building.
- Prisma 7 uses a driver adapter: always get the client via `src/lib/prisma.ts` (`PrismaPg` + `DATABASE_URL`). Do not instantiate `PrismaClient` elsewhere.
- Datasource is PostgreSQL. Apply migrations with `prisma migrate` commands.

## Auth (custom, not NextAuth)

- HMAC-signed cookie session (`as_session`), token logic in `src/lib/session.ts`, cookie helpers + audit logging in `src/lib/auth.ts`. Requires `AUTH_SECRET` env var.
- Route protection lives in `src/proxy.ts` — **Next 16 renamed Middleware to Proxy** (`proxy.ts` next to `app/`, named `proxy` export). It redirects non-`Administrador` sessions away from `/admin` and bounces logged-in users off `/login`/`/register`. Server-side checks should use `getSession()` from `@/src/lib/auth`.
- API routes: `src/app/api/auth/{login,register,logout,me}/route.ts`. Failed logins are recorded in `BitacoraAcceso` via `registrarAcceso`.

## Structure & conventions

- Routes: `src/app/(auth)/` (login/register), `src/app/(client)/` (public site, `/`), `src/app/admin/` (admin panel), shared `layout.tsx` at `src/app/`.
- Path alias `@/*` maps to the **repo root** (e.g. `@/src/lib/prisma`), not to `src/`.
- The entire domain is Spanish: Prisma models/enums (`Usuario`, `RolUsuario`, `SolicitudAdopcion`…), user-facing error messages, and comments. Follow suit in new code.
- Tailwind 4 is wired through a Turbopack rule in `next.config.ts` (`@tailwindcss/turbopack` loader); there is no `tailwind.config`. Page-specific CSS lives beside pages (e.g. `panda-login.css`).

## Gotchas

- `.env` (with `DATABASE_URL`, `AUTH_SECRET`) is gitignored and required for dev, seed, and migrations.
- `pnpm-workspace.yaml` sets `allowBuilds` to block postinstall builds for esbuild/sharp/workerd/unrs-resolver — don't "fix" missing native binaries by enabling them without need.
- Don't delete or rewrite the `nextjs-agent-rules` block at the top; `next dev` re-adds it.
