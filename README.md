# Service Request System

A full-stack application for managing service requests between
customers, technicians, and a manager.

## Tech Stack
- **Frontend**: React + Vite
- **Backend**: FastAPI (Python)
- **Database**: MySQL

## Prerequisites
- Node.js (v18+)
- Python (3.11+)
- MySQL Server

### 2. Backend Setup
Navigate to the `backend` directory:
```bash
cd backend
python -m venv .venv
source .venv/bin/activate  # On Windows: .\.venv\Scripts\activate
pip install -r requirements.txt
```

Copy the environment variables:
```bash
cp .env.example .env
```
*(By default, Vite points to `http://localhost:8000` during development)*

Start the frontend development server:
```bash
npm run dev
```

Start the development server:
```bash
cd service_app
uv run uvicorn service_app.main:app --reload --app-dir src
```

### 3. Frontend Setup
Navigate to the `frontend` directory:
```bash
cd frontend
npm install
npm run dev
```
## Live links

-   **Backend API:** https://service-request-9a97cf28.fastapicloud.dev
-   **Swagger API documentation:**
    https://service-request-9a97cf28.fastapicloud.dev/docs
-   **Frontend:** Add the final Netlify/Vercel URL after deployment
    succeeds.

> Before handing this repository to another developer, verify that the
> current code and deployment settings match this document. In
> particular, confirm that the deployed revision uses SQLite and that
> the database persists across redeployments.

## Features

### Customer

-   Register and log in.
-   Create and view service requests.
-   View request details and service history.
-   Edit or delete an eligible request within the configured 20-minute
    window.
-   See technician contact details after the relevant technician
    accepts.
-   Use notifications and feedback features where implemented.

### Technician

-   Log in and view assigned requests.
-   Accept assignments.
-   Update work progress and mark work completed.
-   Manage profile details.

### Manager

-   View and manage requests and customers.
-   Assign one or more technicians to requests.
-   Manage technicians and view reports where implemented.
-   Enforce the configured limit of six active technicians.
-   Enforce the configured 30-minute delay before assignment.
-   Allow only one manager account, if enabled in the current backend.

Intended request lifecycle:
`NEW → ASSIGNED → ACCEPTED → IN_PROGRESS → COMPLETED`.

## Technology stack

-   Frontend: React, Vite, JavaScript, CSS
-   Backend: Python, FastAPI, Uvicorn
-   ORM: SQLAlchemy
-   Database: SQLite (verify deployed configuration and persistence)
-   Authentication: JWT and password hashing, as implemented
-   Backend hosting: FastAPI Cloud
-   Planned frontend hosting: Netlify

## Repository structure

``` text
service_app/
├── backend/
│   └── service_app/
│       ├── pyproject.toml
│       ├── uv.lock
│       └── src/service_app/
│           ├── main.py
│           ├── database.py
│           ├── auth.py
│           ├── core/
│           ├── models/
│           ├── routers/
│           ├── schemas/
│           └── services/
├── frontend/
│   ├── package.json
│   └── src/
├── README.md
├── prd.md
└── architecture.md
```

Treat this as an expected overview; check the repository for the exact
current file tree.

## Prerequisites

-   Python version required by `backend/service_app/pyproject.toml`
    (currently intended for Python 3.12+)
-   `uv`
-   Node.js and npm
-   Git

## Run the backend locally

Open PowerShell:

``` powershell
cd "path\to\service_app\backend\service_app"
uv sync
```

Create a local `.env` file. Example for SQLite:

``` env
DATABASE_URL=sqlite:///./service_app.db
SECRET_KEY=replace_with_a_long_random_secret
```

Use the exact variable names expected by the current code. Never commit
`.env` or real secrets.

Start the backend:

``` powershell
uv run fastapi dev
```

If the FastAPI CLI entrypoint is not configured, try:

``` powershell
uv run uvicorn service_app.main:app --reload --app-dir src
```

Local API: `http://127.0.0.1:8000`\
Swagger: `http://127.0.0.1:8000/docs`

## Run the frontend locally

In a second terminal:

``` powershell
cd "path\to\service_app\frontend"
npm install
```

If the frontend reads a Vite environment variable, create
`frontend/.env`:

``` env
VITE_API_URL=http://127.0.0.1:8000
```

The frontend code should read it using `import.meta.env.VITE_API_URL`,
or use the existing API configuration if the project uses another
pattern.

Start the frontend:

``` powershell
npm run dev
```

Vite prints the local frontend URL, commonly `http://localhost:5173`.

## Frontend deployment on Netlify

Typical settings when the repository root is connected: - Branch:
`main` - Base directory: `frontend` - Build command: `npm run build` -
Publish directory: `dist`

Add this environment variable in Netlify's site settings:

``` text
VITE_API_URL=https://service-request-9a97cf28.fastapicloud.dev
```
<!-- frontend (frontend): npm run dev , backend (backend/service_app): uv run uvicorn service_app.main:app --reload --app-dir src -->

Do not include `/docs` or a trailing slash in the API base URL. `VITE_`
values are exposed in browser code; never store passwords or secrets in
them. Trigger a new build after changing environment variables.

## Production Deployment

Please refer to the deployment documentation for production configuration, including setting proper CORS origins, secure environment variables, and optimized build commands.
<!-- fornt reaact+vite => vercel.
backend python fastapi => fastapi cloud -->

## CORS

The backend must allow the exact deployed frontend origin. Once Netlify
gives you the final site URL, add that origin to the backend's CORS
configuration and redeploy the backend. Opening `/docs` does not prove
that frontend CORS is configured correctly.

## SQLite deployment caution

SQLite stores data in a file. Confirm that the hosting platform provides
persistent storage and that the file remains available across
redeployments. Do not assume a local SQLite file is durable or suitable
for multiple application instances. Back up important data before schema
or deployment changes.

## Security checklist

-   Keep `.env`, database files, and credentials out of Git.
-   Commit `.env.example` with placeholder values only.
-   Use a strong deployment `SECRET_KEY`.
-   Enforce role permissions on the backend, not only in React.
-   Use HTTPS for deployed traffic.
-   Do not use real customer data in a demo environment.

## Troubleshooting

-   **Frontend cannot reach API:** check `VITE_API_URL`, browser
    Network/Console, and CORS.
-   **Database/table error:** check `DATABASE_URL`, the process working
    directory, database file path, and schema initialization/migrations.
-   **Netlify build fails:** check `frontend/package.json`, build logs,
    and the base/publish directories.

## Related documents

-   [Product Requirements Document](prd.md)
-   [Architecture](architecture.md)

