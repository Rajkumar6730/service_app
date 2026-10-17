# System Architecture

## Service Request Management System

## 1. Overview

The application separates the browser-based frontend from the backend
API.

-   **Frontend:** React + Vite; displays role-specific pages and sends
    HTTP requests.
-   **Backend:** FastAPI; handles endpoints, validation, authentication,
    authorization, and business rules.
-   **ORM:** SQLAlchemy.
-   **Database:** SQLite is the intended database after the migration.
    Verify the deployed revision and file path.
-   **Backend hosting:** FastAPI Cloud.
-   **Frontend hosting:** Netlify is planned; add the final live URL
    after deployment succeeds.

Backend: `https://service-request-9a97cf28.fastapicloud.dev`\
Swagger: `https://service-request-9a97cf28.fastapicloud.dev/docs`

## 2. Context diagram

``` text
Customer / Technician / Manager
              |
              v
      React + Vite Frontend
              |
        HTTPS / JSON API
              |
              v
        FastAPI Backend
       - Authentication
       - Role authorization
       - Input validation
       - Business rules
       - Request lifecycle
              |
              v
       SQLAlchemy ORM
              |
              v
        SQLite database
```

The deployed frontend must call the public backend URL. `localhost` is
for local development only.

## 3. Backend modules

  -----------------------------------------------------------------------
  Module                              Responsibility
  ----------------------------------- -----------------------------------
  `main.py`                           Create/configure FastAPI, register
                                      routers and middleware, and set up
                                      startup behavior.

  `database.py`                       Load DB configuration, create
                                      SQLAlchemy engine/session factory,
                                      and provide the database
                                      dependency.

  `auth.py`                           Authentication/security helpers,
                                      depending on the current code.

  `models/` and/or `models.py`        SQLAlchemy models. Check which
                                      definitions are canonical before
                                      changing files.

  `schemas/` and/or `schemas.py`      Pydantic request/response schemas.
                                      Check for duplicate/legacy
                                      definitions.

  `routers/`                          HTTP routes grouped by feature or
                                      role.

  `services/`                         Shared business logic where
                                      implemented.

  `core/`                             Shared configuration/utilities
                                      where implemented.
  -----------------------------------------------------------------------

The project has had both package directories and top-level modules.
Inspect imports before moving or deleting files.

## 4. Frontend-to-backend configuration

Use a Vite environment variable if that matches the existing frontend
API client:

``` env
VITE_API_URL=https://service-request-9a97cf28.fastapicloud.dev
```

Read it in React with:

``` javascript
const API_URL = import.meta.env.VITE_API_URL;
```

Do not append `/docs` to the API base URL. `/docs` is the Swagger
interface. Do not put secrets in `VITE_` variables because those values
are exposed to browser code.

## 5. CORS

The backend must allow the exact deployed frontend origin, such as the
final Netlify URL. Replace any placeholder with the real origin and
redeploy the backend after changing CORS configuration. Opening Swagger
does not prove browser CORS is configured correctly.

## 6. Database

Typical local SQLite configuration:

``` env
DATABASE_URL=sqlite:///./service_app.db
```

For SQLAlchemy SQLite connections,
`connect_args={"check_same_thread": False}` is commonly used. Confirm
the current `database.py` before editing it.

Operational considerations: - Relative database paths depend on the
process working directory. - Verify that the application opens the
intended database file. - Do not commit local `.db` files without a
deliberate reason. - Do not delete `service_app.db` or `test.db` before
checking which contains needed data. - Verify whether FastAPI Cloud
provides persistent writable storage and how redeployments/instances
affect SQLite. A local SQLite file should not be assumed durable or
shared across instances. - If reliable persistence or higher concurrency
is required, evaluate a managed database supported by the hosting
environment.

## 7. Authentication and authorization

The project configuration indicates JWT-based authentication and
password hashing; confirm token expiry and implementation details from
source.

Security rules: 1. Authenticate protected API requests. 2. Enforce role
permissions on the backend. 3. Verify request ownership server-side. 4.
Do not rely only on frontend button visibility. 5. Keep `SECRET_KEY`,
passwords, and DB credentials out of Git and frontend bundles. 6. Commit
only placeholder values in `.env.example`.

## 8. Main request flow

### Customer creates a request

1.  Customer signs in.
2.  Frontend sends an authenticated request.
3.  FastAPI validates fields and permissions.
4.  SQLAlchemy stores the request.
5.  Backend returns the request and its initial status.

### Manager assigns technician(s)

1.  Manager opens the request list.
2.  Backend checks role, status, elapsed time, and technician capacity.
3.  Backend saves assignment(s).
4.  Frontend refreshes and shows the new assignment state.

### Technician accepts and completes work

1.  Technician views assigned work.
2.  Technician accepts an eligible assignment.
3.  Backend updates the assignment/status.
4.  Customer sees technician details according to the acceptance rule.
5.  Technician updates progress and completes the work.

Use actual router/schema files to confirm endpoint names and payload
formats; this document describes the high-level flow.

## 9. Deployment layout

``` text
GitHub repository
   |                         |
   | frontend source         | backend source
   v                         v
Netlify build             FastAPI Cloud
React/Vite dist           FastAPI application
   |                         |
   +------ HTTPS API --------+
                |
                v
          SQLite file
      (persistence must
       be verified)
```

Typical Netlify settings: - Branch: `main` - Base directory:
`frontend` - Build command: `npm run build` - Publish directory: `dist`

Add this frontend environment variable:

``` text
VITE_API_URL=https://service-request-9a97cf28.fastapicloud.dev
```

When the base directory is `frontend`, `dist` is relative to that
directory.

## 10. Troubleshooting

-   **API reachability:** open the backend `/docs`.
-   **Frontend API failures:** inspect browser DevTools → Network and
    Console.
-   **CORS errors:** compare the request Origin with the backend
    allow-list.
-   **Database errors:** verify `DATABASE_URL`, working directory, DB
    file, and table initialization/migrations.
-   **Deployment errors:** inspect build/runtime logs; do not share
    secrets in screenshots.

## 11. Items to verify

-   Final frontend URL and hosting provider.
-   Whether deployed code includes the SQLite migration.
-   SQLite file path and persistence across redeployments.
-   Whether tables are created at startup or through migrations.
-   Exact endpoint names, model relationships, and latest test results.
