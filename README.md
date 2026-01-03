# Qwik + Payload (Separated Apps)

This repository contains **two independent web applications**:

- **Qwik frontend**: `apps/qwik`
- **Payload CMS backend (Next.js)**: `apps/payload`

They can be started independently. During local development, the frontend uses a Vite proxy so calls to `/api` (and GraphQL) are forwarded to the backend.

## Table of contents

- [Repository layout](#repository-layout)
- [What you run locally](#what-you-run-locally)
- [Prerequisites](#prerequisites)
- [Local development (run both apps)](#local-development-run-both-apps)
- [Environment variables](#environment-variables)
- [Zitadel authentication (OIDC + PKCE)](#zitadel-authentication-oidc--pkce)
- [API overview](#api-overview)
- [Project structure](#project-structure)
- [Troubleshooting](#troubleshooting)
- [Production notes](#production-notes)
- [Reference documentation](#reference-documentation)

---

## Repository Layout

```
.
├── apps/
│   ├── qwik/        # Qwik + Qwik City frontend (Vite)
│   └── payload/     # Payload CMS backend (Next.js)
│
├── ARCHITECTURE.md
├── SETUP_GUIDE.md
├── QUICK_START.md
├── INTEGRATION_GUIDE.md
├── API_REFERENCE.md
├── TROUBLESHOOTING.md
├── PRODUCTION_DEPLOYMENT.md
└── CURRENT_STATUS.md
```

---

## What you run locally

- **Frontend (Qwik)**
  - URL: `http://localhost:5173`
  - App folder: `apps/qwik`

- **Backend (Payload CMS)**
  - URL: `http://localhost:3000`
  - Admin UI: `http://localhost:3000/admin`
  - App folder: `apps/payload`

---

## Prerequisites

- Node.js (recommended: Node 18+)
- pnpm (recommended, because this repo already uses `pnpm-lock.yaml`)
- MongoDB running locally (or a MongoDB connection string)

---

## Local Development (Run Both Apps)

### 1) Start the backend (Payload)

1. Open a terminal
2. Go to the backend app:

```bash
cd apps/payload
```

3. Install dependencies:

```bash
pnpm install
```

4. Configure environment variables:

- Ensure `apps/payload/.env` exists and has at minimum:

```env
DATABASE_URL=mongodb://127.0.0.1/qwik-payload-store
PAYLOAD_SECRET=your-super-secret-32-character-key-minimum-32-chars!
ZITADEL_API_URL=https://qwik-4xolvg.us1.zitadel.cloud
ZITADEL_CLIENT_ID=353170497439257993
ZITADEL_REDIRECT_URI=http://localhost:5173/auth/callback
```

5. Start the backend:

```bash
pnpm dev
```

Expected:

- Backend: `http://localhost:3000`
- Admin UI: `http://localhost:3000/admin`

Next:

1. Open `http://localhost:3000/admin`
2. Create your first admin user (Payload prompts you on first run)
3. Create at least one Product so the frontend has data to display

### 2) Start the frontend (Qwik)

1. Open a second terminal
2. Go to the frontend app:

```bash
cd apps/qwik
```

3. Install dependencies:

```bash
pnpm install
```

4. Configure environment variables:

- `apps/qwik/.env.local` should exist (example values):

```env
VITE_GRAPHQL_ENDPOINT=/api/graphql
VITE_PAYLOAD_API_URL=/api
VITE_API_BASE_URL=/api
VITE_ZITADEL_API_URL=https://qwik-4xolvg.us1.zitadel.cloud
VITE_ZITADEL_CLIENT_ID=353170497439257993
VITE_ZITADEL_REDIRECT_URI=http://localhost:5173/auth/callback
VITE_MATRIX_HOMESERVER_URL=https://matrix.org
```

5. Start the frontend:

```bash
pnpm dev
```

Expected:

- Frontend: `http://localhost:5173`

---

## How frontend talks to backend in dev

During local development:

- The frontend calls relative URLs like:
  - `/api/auth/zitadel-login`
  - `/api/auth/zitadel-callback`
  - `/api/graphql`

- Vite (frontend dev server) proxies these to the backend at `http://localhost:3000`.

This avoids browser CORS issues and keeps the dev setup simple.

---

## Environment variables

### Frontend (`apps/qwik/.env.local`)

The recommended dev setup is to use relative endpoints:

```env
VITE_GRAPHQL_ENDPOINT=/api/graphql
VITE_PAYLOAD_API_URL=/api
VITE_API_BASE_URL=/api
```

This works because Vite proxies `/api/*` to the backend.

### Backend (`apps/payload/.env`)

At minimum:

```env
DATABASE_URL=mongodb://127.0.0.1/qwik-payload-store
PAYLOAD_SECRET=your-super-secret-32-character-key-minimum-32-chars!
```

If you are enabling Zitadel:

```env
ZITADEL_API_URL=https://qwik-4xolvg.us1.zitadel.cloud
ZITADEL_CLIENT_ID=353170497439257993
ZITADEL_REDIRECT_URI=http://localhost:5173/auth/callback
```

---

## Zitadel authentication (OIDC + PKCE)

This project uses the OAuth2 Authorization Code flow with **PKCE**.

High-level flow:

1. Frontend calls backend `GET /api/auth/zitadel-login`
2. Backend generates `state` + PKCE `code_verifier`/`code_challenge` and redirects to Zitadel
3. Zitadel redirects back to frontend: `http://localhost:5173/auth/callback?code=...&state=...`
4. Frontend POSTs the `code` to backend `POST /api/auth/zitadel-callback`
5. Backend exchanges code at Zitadel token endpoint (with `code_verifier`) and fetches `/userinfo`
6. Backend creates/updates a Payload user and returns tokens to the frontend

Minimum required Zitadel application settings:

- Redirect URI:
  - `http://localhost:5173/auth/callback`
- Post logout redirect URI:
  - `http://localhost:5173/`

If your client wants to verify Zitadel login before sharing Matrix API details, the only thing they need is to run both apps locally (instructions above) and then click “Login with Zitadel” in the frontend.

---

## API overview

### Payload admin

- `GET http://localhost:3000/admin`

### GraphQL

- `POST http://localhost:3000/api/graphql` (recommended to use through the frontend proxy as `/api/graphql`)

### Custom auth routes

- `GET /api/auth/zitadel-login`
- `POST /api/auth/zitadel-callback`

For full example queries and payload shapes, see `API_REFERENCE.md`.

---

## Project structure

Frontend (Qwik):

```
apps/qwik/
├── src/
│   ├── routes/
│   ├── components/
│   └── lib/
└── vite.config.ts
```

Backend (Payload):

```
apps/payload/
├── src/
│   ├── app/
│   ├── collections/
│   └── payload.config.ts
└── next.config.mjs
```

---

## Troubleshooting

Common issues:

- **Backend not running**
  - Symptom: frontend can’t load products / GraphQL fails
  - Fix: start `apps/payload` first, then `apps/qwik`

- **Ports in use**
  - Backend should be `:3000`
  - Frontend should be `:5173`

- **Zitadel redirect mismatch**
  - Redirect URI must match exactly: `http://localhost:5173/auth/callback`

More troubleshooting scenarios are documented in `TROUBLESHOOTING.md`.

---

## Production notes

This repo is designed to deploy the frontend and backend separately:

- Frontend: static/hybrid deploy (Netlify/Vercel/etc.)
- Backend: Node runtime with a MongoDB database

See `PRODUCTION_DEPLOYMENT.md` for environment variables and deployment options.

---

## Reference documentation

The following files contain deeper detail. This root README is the **authoritative** guide for the current folder layout.

- `QUICK_START.md`
- `SETUP_GUIDE.md`
- `ARCHITECTURE.md`
- `INTEGRATION_GUIDE.md`
- `API_REFERENCE.md`
- `TROUBLESHOOTING.md`
- `PRODUCTION_DEPLOYMENT.md`
- `CURRENT_STATUS.md`

---

## What changed (for your client)

- Qwik frontend moved to: `apps/qwik`
- Payload backend moved to: `apps/payload`
- Each app has its own `package.json` and can be started independently.

---

## Cleanup (pending)

You asked to “clean the repo” by deleting unwanted files.

I have not deleted anything yet.

Next step: I’ll propose a list of safe-to-delete items (build outputs, old artifacts, duplicated lockfiles if any, etc.) and you can explicitly approve before anything is removed.
