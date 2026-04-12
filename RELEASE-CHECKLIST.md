# Release checklist · starter-hono-workers

Short checklist before tagging or announcing this repo.

- [ ] **Secrets:** `PINARKIVE_API_KEY` in `.dev.vars` locally; `wrangler secret put` in production.
- [ ] **Vars:** `PINARKIVE_API_BASE_URL` (and optional `PINARKIVE_CLUSTER_ID`) match README / `wrangler.jsonc`.
- [ ] **Install:** `npm install`
- [ ] **Lint:** `npm run lint`
- [ ] **Bundle:** `npx wrangler deploy --dry-run` (or CI equivalent)
- [ ] **Manual test:** one real upload with a valid key; **CID** shows in UI.
- [ ] **Error path:** e.g. bad request; confirm error JSON and status.
- [ ] **GitHub:** description + topics (`pinarkive`, `ipfs`, `cloudflare-workers`, `hono`, …).
- [ ] **Media (after publish):** add short + full demo GIFs; link from README **Preview assets**.
- [ ] **LICENSE** present at repo root.
