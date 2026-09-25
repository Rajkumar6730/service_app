# Service Request Platform

A full-stack web application for managing service requests, assigning technicians, and tracking workloads. 

## Tech Stack
- **Frontend**: React + Vite
- **Backend**: FastAPI (Python)
- **Database**: MySQL

## Prerequisites
- Node.js (v18+)
- Python (3.11+)
- MySQL Server

## Getting Started (Local Development)

### 1. Database Setup
Ensure your MySQL server is running. Create a new database:
```sql
CREATE DATABASE service_hub_db;
```

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
Edit `.env` and fill in your MySQL credentials and a secure `SECRET_KEY`.

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

## Production Deployment

Please refer to the deployment documentation for production configuration, including setting proper CORS origins, secure environment variables, and optimized build commands.
