# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

A frontend take-home assignment: build a "Resources Management" React app on top of a provided Express + MongoDB backend (`backend/`) and a provided design system (`src/design-system/`). All app code lives in `src/`. The full assignment brief, including the evaluation criteria and disqualifiers, is in `docs/requirements/taskmodularformcreator 1.md`. Read it before changing the scope or behaviour.

### Hard constraints (violating any of these disqualifies the submission)
- **Never modify `backend/` or `src/design-system/`.** Consume them as-is.
- `npm run build` and `npm run lint` must pass with zero errors.
- Use the backend API exactly as documented in `backend/README.md` (the contract source of truth). Never bypass or work around it.
- Required routes: `/resources` (list, create, delete), `/resources/:resourceId` (overview: both modules, progress, provision action), `/resources/:resourceId/details` (summary of both modules + status), `/resources/:resourceId/basic-info`, `/resources/:resourceId/project-details`.
- Bonus: add a frontend service to the root `docker-compose.yml` so the full stack starts with one command.

## Commands

```bash
docker compose up -d --build                # full stack: frontend (nginx) :5173, backend :5001 (Swagger /docs), mongo :27017
docker compose up -d backend mongo          # backend only, when running the frontend with `npm run dev`
npm run dev                   # Vite dev server on :5173
npm run build                 # tsc -b (type check) + vite build
npm run lint                  # eslint .
npm test                      # unit tests (vitest project "unit", node env, src/**/*.test.ts)
npx vitest run --project unit src/features/resources/model/rules.test.ts   # single unit test file
npx prettier --write src      # no format script; .prettierrc: single quotes, no semicolons, trailing commas, width 90
npm run storybook             # design-system stories on :6006
npx vitest run --project storybook          # story tests in headless Chromium (needs `npx playwright install chromium`)
curl -X DELETE http://localhost:5001/api/admin/database                   # wipe all resources
```

The `frontend` compose service (root `Dockerfile`, `docker/nginx.conf`) bakes `VITE_API_URL` in at build time, so rebuild with `--build` after code changes. It also takes port 5173, so stop it before running `npm run dev`.

Frontend env: `VITE_API_URL` defaults to `http://localhost:5001` (see `.env.example`). The backend's CORS allows only `http://localhost:5173`, so the frontend must be served from that exact origin. A dev server on another port can't reach the API.

## TypeScript / lint gotchas

- `verbatimModuleSyntax`: type-only imports must use `import type`.
- `erasableSyntaxOnly`: no `enum`, `namespace`, or constructor parameter properties. Use `as const` unions instead.
- `noUnusedLocals` / `noUnusedParameters` are on.
- `eslint-plugin-react-refresh`: `.tsx` files should export only components. Put hooks, contexts, and constants in separate `.ts` files.
- `eslint-plugin-react-hooks` v7 recommended config includes React Compiler rules (for example, no synchronous `setState` inside effects).
- Dependencies are pinned to exact versions (no `^`). `.npmrc` sets `min-release-age=7`.

## Backend contract (big picture)

Resource shape: `{ _id, resourceId (auto-increment number), name, status: 'draft' | 'completed', basicInfo: { resourceName, owner, email, description, priority }, projectDetails: { projectName, budget, category, options: string[] }, createdAt, updatedAt }`. All values are strings except `options`. `budget` is a digit string, not a number. `/:id` accepts the numeric `resourceId` or an ObjectId.

Which write endpoint is allowed depends on status:

| Status | Allowed writes | Rejected (400) |
|---|---|---|
| `draft` | `PATCH /api/resources/:id/basic-info`, `PATCH .../project-details` (only after Basic Info is complete), `PATCH .../provisioning` (only when both modules are complete) | `PUT /api/resources/:id` |
| `completed` | `PUT /api/resources/:id` with the full `{ name, basicInfo, projectDetails }` | module PATCHes, re-provisioning |

Non-obvious behavior (see `backend/src/modules/resources/resource.service.ts`):
- Module PATCHes require the **whole module payload** (every field present), not a partial update.
- `resourceName` is immutable: `basicInfo.resourceName` (and `name` on PUT) must equal the current name, or the request fails with 400. Send it back unchanged and render it as a locked field. Names are unique case-insensitively at creation.
- "Complete" means every module field is non-empty (and `options.length > 0`). The frontend should derive module progress the same way.
- Server-side validation that the frontend forms should mirror:
  - `resourceName` / `projectName`: `^[A-Za-z0-9 -]+$`, max 255 chars
  - `owner`: `^[A-Za-z ]+$`, max 255 chars
  - `email`: basic email format
  - `description`: max 1000 chars
  - `priority`: `low | medium | high`
  - `budget`: `^\d+$`
  - `category`: `internal | external | vendor`
  - `options`: at least one of `FE devs`, `BE devs`, `Designer`, `Data Eng`, `Product Owner`

  Values are trimmed server-side.
- `PATCH .../provisioning` returns the plain updated resource. Ignore the unused `ProvisioningResponse` schema in `backend/src/config/swagger.ts`.
- `GET /api/resources` supports `page`, `pageSize` (max 100), `status`, `name`, and `sortOrder` (`desc` by default). Pagination is server-driven, and `page` is clamped to `totalPages` (always at least 1). The `name` filter goes unescaped into a Mongo `$regex`, so escape regex metacharacters on the client.
- Errors look like `{ message, details }`. `message` is human-readable and fine to show to users.

### Completed-resource edit flow
For a `completed` resource, module form edits must **not** call the API. Keep them in an in-memory frontend buffer (not localStorage or sessionStorage; the buffer must be lost on refresh or close). Persist only on explicit user submit, with a single `PUT` containing both modules merged over the server data.

## App architecture (`src/`)

- `App.tsx`: QueryClient (no retries on 4xx), `EditBufferProvider`, and the data router (`createBrowserRouter`, required by `useBlocker`).
- `features/resources/components/ResourceLayout.tsx` is the `/resources/:resourceId` route element. It loads the resource once, handles 400/404 as "not found", and passes `{ resource, resourceKey }` to child pages through outlet context (`useResourceOutlet()`). `resourceKey` is the raw route param and is used as both the detail query key and the API id.
- `features/resources/model/` holds the pure, unit-tested domain logic. `rules.ts` mirrors the backend's completeness and gating checks. `schemas.ts` holds the Zod schemas. `editBuffer.ts` holds the staged-edit reducer and `buildReplacePayload`. Keep business rules here, not in components.
- `features/resources/queries.ts` holds query keys and hooks. Mutations write the returned resource into the detail cache and invalidate all lists.
- Completed-resource edits are staged with `useEditBuffer().stage(...)`, saved by `PendingChangesPanel` on the overview with one PUT, and discarded on delete. Module pages branch on `resource.status`: PATCH for drafts, stage for completed resources.
- Module forms use `ModuleFormShell`. It navigates to `successTo` in an effect after `isSubmitSuccessful`, rather than inside the submit handler, so `LeaveGuard` doesn't block the post-submit navigation.
- List filters live in URL search params (`useResourceListParams`).

## Design system usage

- Import from `src/design-system` (barrel `index.ts`). `main.tsx` already wraps the app in `ThemeProvider` + `GlobalStyles`.
- Style app code with styled-components, using theme tokens (`theme.colors.*`, `theme.spacing.*`, `theme.radii.*`, `theme.shadows.*`). `DefaultTheme` is typed via `src/styled.d.ts`. Follow the design system's conventions: `$`-prefixed transient props, and separate `*.styles.ts` / `*.types.ts` files per component.
- Component API notes:
  - `Input` and `Select` take a `state: 'normal' | 'disabled' | 'locked'`. Locked renders a lock icon and sets the control disabled/read-only (use it for the immutable resource name).
  - `Input` with `multiline` renders a textarea.
  - `Select` takes `options: { value, label }[]`, so add a `{ value: '', label: 'Select…' }` placeholder yourself.
  - `CheckboxGroup` is controlled: `value: string[]`, `onChange(next: string[])`.
  - `Button` `state` overrides `disabled`.
  - `Badge` variants: `neutral | info | success | warning`.
- The design-system controls don't forward refs, so react-hook-form wires them through `Controller` via the adapters in `shared/form/fields.tsx` (`TextField`, `SelectField`, `CheckboxGroupField`).
- The design-system `Checkbox` bug (clicking the box does nothing; only the label toggles) is worked around in `CheckboxGroupField` (`ClickableBoxes`). Use that adapter rather than a raw `CheckboxGroup`.
- To render a link that looks like a button, use `shared/ui/ButtonLink` (it reuses `Button.variants`). Don't nest a `Button` inside a `Link`.
- `react-refresh` rejects exporting styled components from `.tsx` files alongside components. Put shared styled primitives in `.ts` files (see `shared/ui/layout.ts`, `shared/form/FieldGrid.ts`).
- `src/index.css` and `src/App.css` are not imported anywhere. Global styles come from `GlobalStyles`.
