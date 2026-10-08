# AI Development Log

This log records how AI assistance was used while building DataBridge. It is a working note, not a claim that every line was reviewed by a separate person after the fact. Verification results below are filled in only after the command or check actually ran.

## Tools used

- ChatGPT:
  - helped interpret the assignment
  - helped select and define the DataBridge product concept
  - helped define the technical and product scope
  - prepared the detailed implementation prompt used in Cursor
  - helped guide the Neon/PostgreSQL setup and the manual verification process
- Cursor, with the coding agent in this workspace:
  - inspected the empty workspace and created the repository
  - implemented the Next.js application
  - implemented the components, validation, API, Prisma integration, and tests
  - performed code-level verification
  - assisted with the final project audit
- The Next.js 16 documentation shipped inside `node_modules/next/dist/docs/`, because the scaffold explicitly warns that this Next.js version differs from older training data

The suggestion notes below are decisions made while implementing in Cursor. They are not a transcript of the earlier ChatGPT planning session.

## Initial product decisions

The workspace was empty: no framework, no package manifest, no git history, and no database. The project was initialized with `create-next-app` (Next.js 16, App Router, TypeScript, Tailwind CSS, ESLint, npm).

Scope stayed on one landing page, one `POST /api/requests` endpoint, one Prisma model, and one shared Zod schema. The page does not implement integrations, accounts, payments, or an admin UI.

PostgreSQL is the persistence target through `DATABASE_URL`. No connection string is stored in the repository. During implementation, a live insert could not be run because no database was configured yet. That check was completed later: the Prisma migration was applied, a real form submission was saved, and the resulting `IntegrationRequest` row was confirmed in the Neon SQL Editor.

The service list lives in `src/lib/validation/integrationRequest.ts`. The landing page, the client form, and the API all use that module. The API persists only `name`, `email`, `service`, and `description`. `status` defaults to `new` in Prisma. `createdAt` uses the database default. A client cannot set either field.

## AI suggestions accepted

### Keep the generated Next.js 16 scaffold

Suggestion: start from `create-next-app` instead of hand-writing the toolchain.

Why accepted: the workspace was empty, and the generator already matched the requested stack (App Router, TypeScript, Tailwind, ESLint).

Result: the app uses Next.js 16.4.0, React 19, and Tailwind CSS 4, including the scaffold's `cacheComponents` and `partialPrefetching` settings. `POST` route handlers are not cached by that mode.

### Share one Zod schema

Suggestion: validate in the browser and again on the server with the same schema.

Why accepted: two hand-written rule sets would drift, and the exercise requires both layers.

Result: `integrationRequestSchema` trims strings, checks lengths, normalizes email case, and allows only the four service values.

### Lazy Prisma client

Suggestion: construct `PrismaClient` on first use rather than at import time.

Why accepted: `next build` should still succeed when `DATABASE_URL` is absent. A missing database must fail the request, not the production build.

Result: `getPrisma()` throws only when a request tries to persist. The route turns that failure into a generic 500. The browser does not receive the exception.

### Disable the submit control and ignore a second submit in the same turn

Suggestion: a disabled button alone is the loading guard.

Why modified into a stronger version: React state updates after the click handler starts, so two very fast submits can both pass a state check. A ref is set synchronously before the request starts.

Result: the button shows "Sending request...", fields are disabled, and `submittingRef` returns early if a submit is already in progress.

### Do not log the database exception

Suggestion: `console.error(error)` in the persistence `catch`.

Why accepted as a narrower log: Prisma errors can include the database URL. The server logs only the sentence "Integration request persistence failed." The client receives a fixed message.

### Hidden honeypot

Suggestion: a simple hidden field is enough spam friction for this exercise, without CAPTCHA or a rate-limit service.

Why accepted: it is a few lines and does not add a dependency. A non-empty `faxNumber` fails validation and is not written.

## AI suggestions modified

### Vitest setup from the Next.js docs

The Next.js Vitest guide recommends `jsdom`, Testing Library, `@vitejs/plugin-react`, and `vite-tsconfig-paths`.

Those packages are for rendering components. The tests in this project check the shared schema and the route handler. Vitest alone, with a path alias in `vitest.config.mts`, is enough. The extra packages were not installed.

### Package name

`create-next-app` refused to use the workspace folder name because npm package names cannot contain capital letters. The app was generated in a temporary folder and moved to the workspace root. The package name was then changed from `databridge-temp` to `databridge`.

### Template dark mode

The starter stylesheet switched colors with `prefers-color-scheme`. That second theme was not designed or checked for contrast. It was removed. The page uses one light theme with a dark footer.

### Success response

A completed `fetch()` is not treated as success. The form shows the success state only when the response status is 201 and the JSON body has `success: true` plus a non-empty `requestId`.

## AI suggestions rejected

### Prisma 8 release candidate

`prisma generate` printed an upgrade notice from 6.19.3 to 8.0.0-rc.21. A release candidate is the wrong choice for this exercise. Prisma 6.19.3 stays, with the normal `schema.prisma` datasource.

### Browser `localStorage` as a stand-in database

The exercise requires server-side persistence. A missing `DATABASE_URL` is reported as configuration required. Requests are not stored in the browser.

### Form library, animation library, or global state library

The form has four fields. React state and the shared Zod schema cover it. No animation package was added. The only motion is native `scroll-behavior`, and it is turned off when the user prefers reduced motion.

### Authentication, CAPTCHA, and rate-limit infrastructure

They are outside the requested product. The honeypot is the only spam control.

### Logging or returning raw database errors

Rejected so connection details and stack traces stay off the client.

## Other implementation adjustments

### `@types/node` raised to 24

Vitest 5 could not be installed against the scaffold's `@types/node` 20 because of a peer-dependency conflict. This machine runs Node.js 24, so `@types/node` was updated to 24 and Vitest 5.0.3 was installed. The app code does not depend on that type package directly.

### Focus ring uses `:focus`

The first stylesheet targeted `:focus-visible` only. In the embedded browser, `document.hasFocus()` was false, so `:focus` did not match and the ring could not be seen. The rule was changed to `:focus` on links, buttons, and fields. A real keyboard or pointer focus in a focused window gets a 2px accent outline.

## Validation performed

- `npm test`: PASS. Vitest 5.0.3, 2 files, 15 tests. Re-run during the delivery audit on 8 October 2026: 15 tests passed.
- `npm run lint`: PASS. Re-run during the delivery audit with no findings.
- `npm run build`: PASS. Re-run during the delivery audit. Next.js 16.4.0 compiled the static page and a dynamic `POST /api/requests` route. `prisma generate` loaded the local `.env` and did not print the connection string.
- Real PostgreSQL persistence: PASS. After Neon was configured, `npx prisma migrate deploy` applied the migration. A real request was submitted through the DataBridge form, and the resulting `IntegrationRequest` row was confirmed in the Neon SQL Editor. The connection string is only in the local `.env` file and is not recorded here.
- Invalid email in the browser: PASS. The email field showed "Enter a valid email address.", focus moved to that field, and the dev server logged no `POST`.
- Valid submission with no database: PASS. The button read "Sending request..." and was disabled, `aria-busy` was true, one request was sent, the API returned 500, and the page showed "We couldn't save your request. Please try again." It did not show the success message. The server log was only "Integration request persistence failed."
- Double submit: PASS. Two `requestSubmit()` calls during one in-flight request produced one `POST`.
- Layout: PASS for overflow. At 1440px, 768px, and 375px, `scrollWidth` did not exceed `clientWidth`. The nav, hero, service cards, and form were readable at those widths.
- Keyboard focus paint: NOT fully verified in the embedded browser, because that document was not the focused window (`document.hasFocus()` was false), so the `:focus` outline could not be painted. The name field did receive `document.activeElement` after a click. The outline rule is in the stylesheet.

## Known limitations

- DataBridge is fictional. The site does not connect to Excel, CRMs, or third-party APIs.
- There is no admin screen, authentication, email notification, or payment flow.
- Spam protection is a hidden honeypot only. It will not stop a determined sender.
- The form needs JavaScript. It posts with `fetch` so the page can show loading, success, and error without a full reload.
- The repository does not include a live deployment URL. Production still needs `DATABASE_URL` configured in the host before the form can save there.
- Search engines are asked not to index the site (`robots: noindex`) so the fictional brand is less likely to be mistaken for a real company.
