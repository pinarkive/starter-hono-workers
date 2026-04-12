# PinArkive · Hono + Cloudflare Workers starter

Official PinArkive starter: one **Cloudflare Worker** with **Hono**—**`GET /`** serves a minimal HTML UI, **`POST /api/upload`** sends the file with **`PinarkiveClient`** from **`sdk-ts`**. **`PINARKIVE_API_KEY`** lives in **`.dev.vars`** (local) or **Wrangler secrets** (production).

These starters are intended to be published as public repositories under the PinArkive GitHub organization and are free to use.

## What this starter is for

Teams that want the **smallest possible deployable unit** on the edge: no separate frontend build, secrets via Wrangler, and PinArkive called from the Worker runtime.

## When to use this vs the others

| Choose **Hono + Workers** (this repo) | Choose **Next.js** | Choose **Vite + Express** |
|--------------------------------------|--------------------|---------------------------|
| **Cloudflare Workers** | Next on **Vercel** | **Node** + Vite SPA |

## Why PinArkive?

[PinArkive](https://pinarkive.com) helps you **upload content**, obtain **CIDs**, and lean on **IPFS-backed storage** through a managed API instead of self-hosting IPFS. This Worker forwards uploads with the official TypeScript SDK so you stay close to production patterns.

## Stack

Hono 4 · Wrangler 4 · TypeScript · **`sdk-ts`** → `@pinarkive/pinarkive-sdk-ts` (bundled in the Worker; not a browser script you author separately)

## Quick start

```bash
cp .dev.vars.example .dev.vars
# Set PINARKIVE_API_KEY in .dev.vars

npm install
npm run dev
```

Open the URL Wrangler prints (e.g. **http://localhost:8787**).

## Environment variables

| Variable | Required | Description |
|----------|----------|-------------|
| `PINARKIVE_API_KEY` | Yes | **`.dev.vars`** locally; **`wrangler secret put`** in production. |
| `PINARKIVE_API_BASE_URL` | No | Set in **`wrangler.jsonc`** `vars` (default API v3 root) or the dashboard. |
| `PINARKIVE_CLUSTER_ID` | No | Optional `vars` entry for SDK `cl`. |

See **`.env.example`** for Workers-specific notes (`.env` is not loaded at runtime).

## How upload works

1. The page script **`POST`s** **`multipart/form-data`** with **`file`** to **`/api/upload`**.
2. The Worker parses the body, then **`uploadFileWithPinarkiveSdk`** in **`src/pinarkive.ts`** uses **`PinarkiveClient.uploadFile`** (**`sdk-ts`**). The SDK uses **`fetch`** / **`FormData`**, supported on Workers.
3. Response body: **`{ ok, cid, data, error? }`** with matching HTTP status; **`httpStatus` is not in the JSON.**

## HTTP status behavior

| Situation | Status |
|-----------|--------|
| Upload succeeded (`ok: true`) | **200** |
| Missing / wrong **`file`** field, invalid multipart | **400** |
| Empty file | **400** |
| File over limit | **413** |
| Missing `PINARKIVE_API_KEY` | **500** |
| PinArkive API error | SDK **`statusCode`** if **400–599**, else **400** |
| Other unexpected errors | **400** |

## Example success JSON

```json
{
  "ok": true,
  "cid": "bafybeiexample…",
  "data": {
    "cid": "bafybeiexample…",
    "status": "ok"
  }
}
```

## Example error JSON

Missing API key (HTTP **500**):

```json
{
  "ok": false,
  "cid": null,
  "data": null,
  "error": "Missing PINARKIVE_API_KEY. See README and the environment example file in this repository."
}
```

Invalid multipart (HTTP **400**):

```json
{
  "ok": false,
  "cid": null,
  "data": null,
  "error": "Invalid multipart body."
}
```

## Deployment

```bash
npx wrangler login
npx wrangler secret put PINARKIVE_API_KEY
npm run deploy
```

Adjust **`name`** in **`wrangler.jsonc`** if the Worker name must be unique. Large payloads may hit Worker limits; use a different upload strategy for very big files.

## Project structure

```text
src/
  index.ts              # Routes
  html.ts               # Inline UI
  pinarkive.ts          # sdk-ts wrapper
  normalize-pinarkive-response.ts
wrangler.jsonc
```

## Notes on **`sdk-ts`**

- **`sdk-ts`** aliases **`@pinarkive/pinarkive-sdk-ts`** and runs **inside the Worker bundle** only.
- The public **`sdk-ts@1.0.0`** package on npm is not PinArkive; this template uses the **alias** to **`@pinarkive/pinarkive-sdk-ts`**.

## Preview assets (after publish)

Add when you have real recordings (no broken links in-repo):

- **Short demo (3–5 s):** upload → CID.
- **Full demo (10–15 s):** clone → install → `.dev.vars` → dev → upload → CID.

Link from here after adding files under e.g. **`docs/`**.

## Scripts

| Script | Description |
|--------|-------------|
| `npm run dev` | `wrangler dev` |
| `npm run deploy` | `wrangler deploy` |
| `npm run lint` | ESLint |

## License

[MIT License](./LICENSE). PinArkive API usage follows PinArkive’s terms.
