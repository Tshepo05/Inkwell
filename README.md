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

### 4. Add OpenAI API key

In the same Convex environment variables panel, add:

```
OPENAI_API_KEY=sk-...
```

### 5. Run the app

In one terminal:

```bash
npx convex dev
```

In another:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

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
