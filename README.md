# Resource manager — Modular Form Creator

Frontend for creating, tracking, and provisioning resources through two form modules (Basic info and Project details), built on the provided backend and design system. Neither of those was modified. The assignment brief is in [docs/requirements](<docs/requirements/taskmodularformcreator 1.md>).

## Running it

**Full stack, one command** (frontend, backend, MongoDB):

```bash
docker compose up -d --build
```

| Service | URL |
|---|---|
| App | http://localhost:5173 |
| API | http://localhost:5001 |
| Swagger | http://localhost:5001/docs |

The frontend container builds the app and serves it with nginx on host port 5173. That is the origin the backend's CORS allows, so open the app at `localhost:5173`, not `127.0.0.1`.

**Local development** (backend in Docker, frontend with hot reload):

```bash
docker compose up -d backend mongo
npm install
npm run dev            # http://localhost:5173
```

`VITE_API_URL` defaults to `http://localhost:5001`. Override it in `.env` (see `.env.example`).

| Script | Purpose |
|---|---|
| `npm run build` | Type check (`tsc -b`) and production build |
| `npm run lint` | ESLint |
| `npm test` | Unit tests for the domain logic (Vitest) |
| `npm run storybook` | Design-system stories |

## Routes

| Route | Page |
|---|---|
| `/resources` | List: create, search, filter by status (with counts), sort, paginate, delete |
| `/resources/:resourceId` | Overview: progress track, provisioning, saving staged edits |
| `/resources/:resourceId/basic-info` | Basic info form |
| `/resources/:resourceId/project-details` | Project details form (locked until Basic info is complete) |
| `/resources/:resourceId/details` | Summary of both modules, status, and dates |

## How the business rules are implemented

**Draft resources.** Each module form saves through its own `PATCH` endpoint. Project details is gated in three places: the tab is disabled, the overview step is locked, and the page refuses direct URL access while Basic info is incomplete. The completeness checks in `model/rules.ts` copy the backend's own `isBasicInfoComplete` / `isProjectDetailsComplete`, so the UI never offers an action the API would reject.

**Provisioning.** The provision step is enabled only when both modules are complete and the resource is still a draft. The button is not shown for completed resources, so re-provisioning can't be triggered. The backend remains the source of truth: any error it returns is shown to the user.

**Completed resources.** Form edits are not sent to the API. "Apply changes" stages them in an in-memory edit buffer: a `useReducer` in a React context, deliberately not stored in `localStorage` or `sessionStorage`. The overview page then shows the staged modules with **Save changes** and **Discard**. Saving sends a single `PUT` containing both modules (staged values merged over the saved data). The buffer:
- survives navigating within the app, and reopening a module form shows the staged values with a "Revert to saved" option;
- is lost on refresh or tab close, as required; the browser asks for confirmation before that happens;
- ignores edits identical to the saved values, so applying an unchanged form doesn't leave a pending change behind.

**Resource name.** The name is shown as a locked field and isn't part of the form state. The original name is added back to every `PATCH` / `PUT` payload, because the backend rejects any change to it.

## Technical decisions

- **TanStack Query** for server state: caching, loading and error states, and invalidation. After every mutation, the returned resource is written into the detail cache and the list queries are invalidated.
- **react-hook-form + Zod** for forms. The schemas in `model/schemas.ts` use the backend's regexes, length limits, and allowed values, so most errors are caught before a request is made. Server errors still appear in the form.
- **List state in the URL** (`?status=&name=&sort=&page=`), so filters survive a refresh and the back button. Search is debounced. Status counts come from the backend's `totalItems` (one `pageSize=1` request per status). The `name` filter is regex-escaped before sending, because the backend passes it into a Mongo `$regex`.
- **Design system used as-is.** App code imports the design-system components and theme tokens. The two additions are wrappers rather than changes: `ButtonLink` (a router link that reuses the Button's variant styles) and `DangerButton` (a re-coloured `styled(Button)` for delete, since the design system has no danger variant). The design system's `Checkbox` only toggles when its label text is clicked, because the visible box sits on top of the hidden input. `CheckboxGroupField` works around this with scoped CSS that places the invisible input over the box.
- **Unsaved form edits.** Leaving a module form with unapplied edits asks for confirmation, using React Router's `useBlocker` and the design-system Drawer.

## Project structure

```
src/
  api/client.ts                  fetch wrapper, ApiError
  app/                           app shell, 404, route error boundary
  features/resources/
    api.ts, queries.ts           endpoint functions; query keys and hooks
    model/                       types, rules, Zod schemas, edit-buffer reducer (+ unit tests)
    edit-buffer/                 in-memory buffer provider and hooks
    components/                  provisioning track, forms, list rows, etc.
    pages/                       one component per route
  shared/                        form-field adapters, leave guard, layout primitives, hooks
```

## Backend contract notes

The app follows `backend/README.md` and Swagger (`/docs`). Every documented rule was also tested against the running API. A few behaviours aren't in the docs, and the frontend accounts for each:

- **Validation rules are only in the service code.** These include name patterns, allowed category and team-member values, length limits, case-insensitive name uniqueness, and the requirement that module `PATCH` bodies contain the whole module. `model/schemas.ts` copies them.
- **`PATCH …/provisioning` returns a plain `Resource`.** The `ProvisioningResponse` wrapper declared in the Swagger components is never used.
- **`PUT` is documented with the full `Resource` as its body**, but only `name`, `basicInfo` and `projectDetails` are read, so the app sends just those.
- **`name` search is passed straight into a Mongo `$regex`**, so a query like `(` causes a 500. The client escapes regex characters before sending.
- **An invalid id returns 400; a missing one returns 404.** The UI treats both as "Resource not found".

## Working with Claude Code

This project was built with [Claude Code](https://claude.com/claude-code). The repo includes its setup:
- `CLAUDE.md` briefs the agent: hard constraints, commands, the backend contract, and the app's architecture.
- `.claude/settings.json` enables Anthropic's official `frontend-design` plugin for anyone who opens the repo in Claude Code.

## Testing

- `npm test` runs 39 unit tests covering the status and gating rules, schema validation against backend constraints, the edit-buffer reducer, and the `PUT` payload builder.
- The full flow was also tested end to end in a real browser against the running backend: create → validation → gating → `PATCH` → provision → staged edits (no requests sent) → single `PUT` → buffer lost on reload → search, filter, delete → unknown or invalid ids. It was checked on both desktop and mobile widths.
