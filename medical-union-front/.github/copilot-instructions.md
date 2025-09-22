## Quick context for AI coding agents

- Project: medical-union-front (Vue 3 + TypeScript + Vite). UI: Arco Design Web. Mock APIs live under `src/api/mock`.
- Purpose: a prototype front-end for a medical referral system (patients, referrals, approvals).

## High-level architecture

- Single-page app using Vue 3 + vue-router. Routes are declared in `src/router/index.ts` (doctor/patient/admin workspaces).
- Data access: local mock module under `src/api/mock/*` for fast front-end iteration. Real network calls use `src/utils/request.ts` (axios) with base URL from `import.meta.env.VITE_API_BASE_URL`.
- Key pages/components for referral flow:
  - `src/views/doctor/ReferralManagement.vue` — referral list, filters, approval drawer.
  - `src/components/ReferralCard.vue` — list item; emits `open`, `accept`, `reject`.
  - `src/components/PatientDetail.vue` — patient drawer/details; uses `fetchPatientById`.
  - `src/api/mock/referrals.ts` and `src/api/mock/patients.ts` — mock implementations: `fetchReferrals`, `fetchReferralById`, `updateReferralStatus`, `fetchPatients`, `fetchPatientById`.

## Developer workflows (commands)

- Install: `npm install` (run from project root `medical-union-front`).
- Dev server: `npm run dev` (Vite). Default port is printed in console.
- Build: `npm run build` (runs `vue-tsc -b` then `vite build`).
- Preview production build: `npm run preview`.

Notes for the agent: prefer editing front-end code to use the mock API rather than changing network wiring. When converting to a real API, use `src/utils/request.ts` and environment variables `VITE_API_BASE_URL` / `VITE_API_TIMEOUT`.

## Project-specific conventions & patterns

- Mock modules export named functions and TypeScript interfaces (e.g. `ReferralSummary` in `src/api/mock/referrals.ts`). Use those types when editing components.
- Router uses meta fields `requiresAuth` and `roles` to gate routes; auth state is stored in localStorage keys `medical_union_token` and `medical_union_user`.
- Date strings in mocks are ISO or `YYYY-MM-DD`; components display them directly — prefer not to change the format without updating all callers.
- UI uses Arco Design components (prefix `a-`), so follow Arco props/slots patterns (e.g., `a-drawer`, `a-list`, `a-input`).

## Common tasks and where to implement them

- Fix runtime errors during dev: run `npm run dev`, open browser console, and search stack traces. Typical files to check first:
  - `src/views/doctor/ReferralManagement.vue` (list + drawer logic)
  - `src/components/ReferralCard.vue` (emits and click handlers)
  - `src/api/mock/*` (ensure functions return expected shapes)
- Add/modify referral behavior: update `src/api/mock/referrals.ts` and `src/views/doctor/ReferralManagement.vue`. Example: `updateReferralStatus(id,status,note)` updates handledBy/handledAt and returns updated item.
- Replace mock with real API: change imports from `@/api/mock/*` to `@/api/*` and implement network calls using `src/utils/request.ts`. Follow `src/api/REFERRAL_API.md` for expected endpoints.

## Examples (copyable snippets) — how to call key mocks

- Fetch referrals (used in `ReferralManagement.vue`):
  const res = await fetchReferrals({ page: 1, pageSize: 10, q: '张三', status: 'pending' });

- Update status (approval action):
  await updateReferralStatus('r1', 'accepted', '安排专家会诊');

- Fetch patient detail (for drawer):
  const patient = await fetchPatientById('p1');

## Integration and API expectations

- The front-end expects these endpoints (see `src/api/REFERRAL_API.md`):
  - GET /api/referrals?page=&pageSize=&q=&status=
  - GET /api/referrals/:id
  - POST /api/referrals/:id/status  body: { status: 'accepted'|'rejected', note?: string }
- Response wrapper: `src/utils/request.ts` assumes an `ApiResponse<T>` with `code` and `message`. If you wire a real backend, follow the shape used by `request.ts` or adapt `request.ts` to your backend.

## What to do first (priority list for an AI agent)

1. Run dev server and sanity-check the `ReferralManagement` page works with mocks.
2. If errors, open console, find stack traces, and fix the smallest-scoped component first (usually `ReferralCard` or drawer logic).
3. Improve mock `updateReferralStatus` to return handledBy/handledAt (already implemented) and ensure UI surfaces them on card/detail.
4. Generate API communication doc from `src/api/REFERRAL_API.md` and propose backend stubs.

## Files to inspect for deeper changes

- `src/views/doctor/ReferralManagement.vue`
- `src/components/ReferralCard.vue`
- `src/components/PatientDetail.vue`
- `src/api/mock/referrals.ts` and `src/api/mock/patients.ts`
- `src/utils/request.ts`
- `src/api/REFERRAL_API.md`

---

If any section is unclear or you want me to prefer a different workflow (for example, run the dev server now and fix runtime errors), tell me and I'll proceed.  
