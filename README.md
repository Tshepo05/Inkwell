# Inkwell

A calm document editor where you reference plain-text knowledge as you write, with AI co-editing grounded in your sources.

## Stack

- **Next.js** (App Router) + TypeScript + Tailwind CSS
- **Convex** — database, real-time sync, and authentication ([Convex Auth](https://labs.convex.dev/auth))
- **TipTap** — rich text editor
- **OpenAI** (`gpt-4o-mini`) — AI writing assistant (API key stored in Convex only)

## Getting started

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Convex

```bash
npx convex dev
```

This logs you in, creates a deployment, and writes `NEXT_PUBLIC_CONVEX_URL` to `.env.local`.

### 3. Configure Convex Auth keys

Generate JWT keys and add them in the [Convex dashboard](https://dashboard.convex.dev) → your deployment → Settings → Environment Variables:

```bash
node generateKeys.mjs
```

Copy `env.local.example` to `.env.local` if needed, then paste the `JWT_PRIVATE_KEY` and `JWKS` output into the Convex dashboard.

Also set `SITE_URL` on your deployment (required for Convex Auth):

```bash
npx convex env set SITE_URL "http://localhost:3000"
```

Use your real app URL in production (for example `https://your-domain.com`).

### 4. Add OpenAI API key

**Local deployment** (recommended on Windows — avoids a harmless CLI crash on exit):

```bash
# Copy convex.env.example to convex.env, add your key, then:
npx convex env set --from-file convex.env --force
```

Use two arguments, not `KEY=value`:

```bash
npx convex env set OPENAI_API_KEY "sk-your-key-here"
```

**Cloud deployment:** set `OPENAI_API_KEY` in the [Convex dashboard](https://dashboard.convex.dev) → Settings → Environment Variables.

If you see `Assertion failed: !(handle->flags & UV_HANDLE_CLOSING)` after `Successfully set ...`, the variable was still saved. Confirm with `npx convex env list`. Run `convex env` commands in a **separate** terminal from `npx convex dev`.

### 5. Run the app

Convex Auth needs **both** the Convex backend and the Next.js app running. The backend serves HTTP routes on port `3211` (local); without it, sign-in fails with an auth provider discovery error.

**Option A — one command:**

```bash
npm run dev:all
```

**Option B — two terminals:**

```bash
npx convex dev
```

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) (use `localhost`, not your LAN IP, so auth cookies work over HTTP in development).

### Auth error: “Auth provider discovery of http://127.0.0.1:3211 failed”

This means the **Convex HTTP server is not running** on port `3211`. Sign-in and sign-up need both:

| Port | Service |
|------|---------|
| `3210` | Convex database / functions |
| `3211` | Convex HTTP routes (Convex Auth OIDC) |

Fix: start Convex before (or with) Next.js:

```bash
npm run dev:all
```

If you only run `npm run dev`, you must already have `npx convex dev` running in another terminal until you see **Convex functions ready!**

## Pages

| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/auth` | Sign in / sign up |
| `/dashboard` | Document list and create |
| `/documents/[id]` | Editor with knowledge + AI sidebars |

## Project structure

- `convex/` — schema, auth, queries, mutations, and OpenAI action
- `src/app/` — Next.js pages
- `src/components/editor/` — TipTap editor, knowledge sidebar, AI chat
