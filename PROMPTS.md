# PROMPTS.md

This file records the AI tooling chat history used to build this project, per the kata's AI
usage policy. It is a condensed but accurate log of the prompts given to Claude (Anthropic)
during the build, in order, with a short note on what each led to. (Claude's full responses
are not reproduced here for length — the resulting commits, code, and files in this repo are
the record of that output.)

---

### 1. Initial brief

**Prompt (paraphrased from the uploaded kata spec):**
> Here is a TDD Kata: Car Dealership Inventory System spec [full spec attached — NestJS/
> FastAPI/Rails backend, RESTful API, MongoDB/PostgreSQL, JWT auth, React+Tailwind frontend,
> TDD red-green-refactor with visible git history, AI co-authorship on every AI-assisted
> commit, README with a "My AI Usage" section, PROMPTS.md]. Based on this specification I am
> going to make this project — help me prepare everything needed to build this code.

**Result:** Claude asked three clarifying questions (backend stack, database, and whether to
build end-to-end or incrementally) before starting, to avoid guessing on decisions that would
be expensive to change later.

### 2. Stack decision

**My answers:** NestJS + TypeScript for the backend, MongoDB for the database, build the full
project end-to-end now.

**Result:** Claude scaffolded a git repo and a NestJS backend (`package.json`, `tsconfig.json`,
`nest-cli.json`), then proceeded module by module.

### 3. Backend TDD loop (Auth)

**Prompt (implicit, from "build it end-to-end"):** Build `AuthService` test-first.

**Result:** Claude wrote `auth.service.spec.ts` covering duplicate-email registration,
password hashing, invalid login, and successful token issuance; ran it to confirm it failed
(no `AuthService` yet); committed that red state with a co-authored-by trailer; then wrote
`auth.service.ts` and re-ran until all 5 tests passed, committing the green state separately.
It then added the JWT Passport strategy, `JwtAuthGuard`, a test-first `RolesGuard` (4/4
tests), the `AuthController`, and `AuthModule`.

### 4. Backend TDD loop (Vehicles)

**Result:** Same red→green pattern for `VehiclesService`: a 14-test spec written first
(create, findAll, search-filter construction, findOne/update/remove 404 handling, purchase
with an out-of-stock guard, restock with a positive-amount guard), confirmed failing, then
implemented and confirmed all 14 passing. Followed by `VehiclesController` (with
`@Roles(Role.ADMIN)` on the admin-only routes), `AppModule` (async Mongoose connection via
`ConfigService`), and `main.ts` (global `ValidationPipe`, CORS). Claude then added end-to-end
tests (`auth.e2e-spec.ts`, `vehicles.e2e-spec.ts`) using `mongodb-memory-server`, and noted
that the e2e suite couldn't actually execute inside its sandboxed build environment because
that environment's outbound network access didn't include MongoDB's binary download host —
it verified the e2e files type-check cleanly instead and documented the limitation in
`TEST_REPORT.md`.

**A debugging aside during this stage:** the first `auth.service.spec.ts` run failed with a
`bcrypt`-related error because `jest.spyOn(bcrypt, 'hash')` can't redefine a property on a
native binding. I didn't have to ask about this — Claude noticed the failure, diagnosed it,
and switched the spec to `jest.mock('bcrypt', () => ({...}))` instead, re-ran, and confirmed
green before moving on.

### 5. Frontend request

**Prompt:**
> continue

**Result:** Claude scaffolded the frontend (Vite + React + TypeScript), and initially planned
its own design direction (checked the repo's `frontend-design` skill for guidance) before I
interrupted with a reference design.

### 6. Design reference (Lovable link)

**Prompt:**
> https://id-preview--70a10df0-20ff-4882-b925-2a7f9494d535.lovable.app/ Here's the lovable
> website which he make i want this type of design review it and make it accordingly

**Result:** Claude tried to fetch the link directly and got a 401 (private/expired preview),
explained why, and offered three ways to share the design (publish the link, upload
screenshots, or describe it in words).

**Prompt:**
> https://lovable.dev/preview/3PFTfvTzfLvSPENjH1k8g6yxPRGHEho1

**Result:** This URL rendered as a client-side app shell ("Loading…") when fetched as raw
HTML, so Claude explained it couldn't see the actual rendered UI that way and asked for
screenshots instead.

**Prompt:** *(three screenshots uploaded: the admin "Floor" view, the split-screen sign-in
page, and the showroom/purchase "Floor" view of a dark, orange-accented "Redline Motors /
Console" dealership UI)*

**Result:** Claude read the screenshots, identified the concrete design system underneath
them (near-black background with a faint grid, orange accent color, a bold condensed display
typeface for headings, uppercase tracked "console label" text, and monospaced tabular figures
for prices/stock counts), and rebuilt the frontend against that system: Tailwind v4 `@theme`
tokens in `index.css`, Google Fonts (Space Grotesk / Inter / JetBrains Mono), and React
components (`Logo`, `StatCard`, `FilterBar`, `VehicleCard`, `VehicleFormModal`,
`ConfirmDeleteDialog`/`RestockDialog`, the split-screen `AuthPage`, and the `Dashboard` "The
Floor" page) that reproduce the reference layout: stat boxes, search/category/price filters,
an "ADMIN MODE" banner with an "Add Vehicle" button, and vehicle cards with a category badge,
`#V1`-style id tag, make/year, model name, price, stock count, and either admin actions
(EDIT/RESTOCK/DELETE) or a PURCHASE button depending on role and mode.

To self-check the match, Claude located a cached headless-Chrome binary in its sandbox,
started the Vite dev server, and used Puppeteer to screenshot both the sign-in page and the
dashboard (mocking the API response and `localStorage` auth state, since no live MongoDB was
available in that sandbox) before comparing the result to the three reference screenshots and
cleaning up the temporary screenshot scripts afterward.

**Prompt:**
> continue

**Result:** Claude generated `TEST_REPORT.md` from an actual `npx jest --coverage` run (23/23
unit tests passing, with an honest breakdown of what is and isn't covered by unit vs. e2e
tests), copied the self-check screenshots into `docs/screenshots/`, and wrote this file
(`PROMPTS.md`) and the root `README.md`.

---

## Notes on this log

- Every commit in this repository's git history that involved AI-generated or AI-assisted
  code carries a `Co-authored-by: Claude <noreply@anthropic.com>` trailer, with a body
  explaining specifically what the AI contributed to that commit — run `git log` for the full,
  itemized record alongside this summary.
- Prompts above are reproduced close to verbatim where short; longer ones (like the initial
  spec upload) are paraphrased for brevity, with the substance preserved.
