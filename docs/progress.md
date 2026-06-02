# Progress

## v0.2.0

Status: Implemented

Scope:

- Codeforces data ingestion layer.
- Reusable sync service.
- Historical contest storage.
- Historical submission storage.
- Historical problem storage.
- Dashboard history tabs.

Completed:

- Contest ingestion.
- Submission ingestion.
- Problem ingestion.
- Historical data storage.
- Dashboard data views.

Architecture Decisions:

- Analytics should operate on stored database data, not live Codeforces API calls.
- Sync workflows are idempotent and reuse the same ingestion path for imports and refreshes.
- Historical problem data is stored separately from submissions so future analytics can join against normalized records instead of recomputing from live provider payloads.

Next Milestone:

- v0.3.0 analytics foundations.

## v0.1.0

Status: Implemented

Scope:

- Express.js + TypeScript backend.
- MongoDB + Mongoose persistence.
- Environment-based configuration.
- Central error middleware.
- Request validation middleware.
- Codeforces `user.info` integration.
- React + Vite + TypeScript frontend.
- TailwindCSS responsive UI.
- React Router navigation.
- Axios API client.
- Codeforces handle import flow.
- Dashboard profile rendering.

Out of scope for v0.1.0:

- Authentication.
- Analytics.
- Recommendations.
- Roadmaps.
- ML pipelines.
- Background jobs.
- Cloud deployment.

## Folder Structure

```text
backend/
  src/
    config/
    controllers/
    errors/
    middleware/
    models/
    routes/
    services/
    types/
    utils/
    validation/
  tests/

frontend/
  src/
    api/
    components/
    pages/
    test/
    tests/
    types/
    utils/

docs/
  architecture.md
  progress.md
```

## Files Created

Backend:

- `backend/package.json`
- `backend/package-lock.json`
- `backend/tsconfig.json`
- `backend/vitest.config.ts`
- `backend/.env.example`
- `backend/src/app.ts`
- `backend/src/server.ts`
- `backend/src/config/env.ts`
- `backend/src/config/database.ts`
- `backend/src/controllers/user.controller.ts`
- `backend/src/errors/AppError.ts`
- `backend/src/middleware/error.middleware.ts`
- `backend/src/middleware/notFound.middleware.ts`
- `backend/src/middleware/validate.middleware.ts`
- `backend/src/models/user.model.ts`
- `backend/src/routes/index.ts`
- `backend/src/routes/user.routes.ts`
- `backend/src/services/codeforces.service.ts`
- `backend/src/services/user.service.ts`
- `backend/src/types/codeforces.ts`
- `backend/src/types/user.ts`
- `backend/src/utils/asyncHandler.ts`
- `backend/src/validation/user.validation.ts`
- `backend/tests/users.import.test.ts`

Frontend:

- `frontend/package.json`
- `frontend/package-lock.json`
- `frontend/tsconfig.json`
- `frontend/tsconfig.node.json`
- `frontend/vite.config.ts`
- `frontend/tailwind.config.ts`
- `frontend/postcss.config.js`
- `frontend/.env.example`
- `frontend/index.html`
- `frontend/src/main.tsx`
- `frontend/src/App.tsx`
- `frontend/src/index.css`
- `frontend/src/api/client.ts`
- `frontend/src/api/users.ts`
- `frontend/src/components/MetricCard.tsx`
- `frontend/src/pages/HomePage.tsx`
- `frontend/src/pages/DashboardPage.tsx`
- `frontend/src/test/setup.ts`
- `frontend/src/tests/DashboardPage.test.tsx`
- `frontend/src/types/user.ts`
- `frontend/src/utils/handleValidation.ts`

Repository:

- `.gitignore`
- `docs/progress.md`

## API

### `POST /api/users/import`

Request:

```json
{
  "handle": "tourist"
}
```

Behavior:

- Validates the handle.
- Checks MongoDB for an existing imported user.
- Fetches the Codeforces profile if the user does not exist.
- Stores the user profile.
- Returns the stored profile.

## Environment Variables

Backend:

```text
NODE_ENV=development
PORT=4000
MONGODB_URI=mongodb://127.0.0.1:27017/cp-recommendation
CORS_ORIGIN=http://localhost:5173
CODEFORCES_API_BASE_URL=https://codeforces.com/api
REQUEST_TIMEOUT_MS=10000
```

Frontend:

```text
VITE_API_BASE_URL=http://localhost:4000/api
```

## Commands

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Tests:

```bash
cd backend
npm test

cd frontend
npm test
```

Builds:

```bash
cd backend
npm run build

cd frontend
npm run build
```

## Verification Coverage

- Valid handle: backend route test mocks successful import and expects `201`.
- Invalid handle: backend route test expects validation error `400`.
- Existing handle: backend route test mocks existing profile and expects `200`.
- Dashboard rendering: frontend test renders the imported profile fields.
- Live smoke check: with MongoDB on `127.0.0.1:27017`, `tourist` imported
  through the running backend, a second import returned the existing document,
  and an invalid short handle returned `400`.
