# Team Task Manager

Full-stack task management web app with role-based access control using Django, Django REST Framework, and React.

## Features

- Signup / Login with JWT authentication
- Projects, members, tasks, and status tracking
- Admin / Member roles
- Dashboard with task status and overdue view
- REST API built with Django REST Framework
- React frontend with client-side routing
- Ready for Railway deployment with Postgres

## Setup

### Backend

1. `cd backend`
2. Create a Python virtual environment: `python -m venv env`
3. Activate the environment: `env\Scripts\Activate.ps1` (PowerShell) or `env\Scripts\activate.bat`
4. `pip install -r requirements.txt`
5. Copy `.env.sample` to `.env`
6. `python manage.py migrate`
7. `python manage.py runserver 8000`

### Frontend

1. `cd frontend`
2. `npm install`
3. `npm run dev`

## Deployment to Railway

Railway supports deploying both backend and frontend in the same project.

### Prerequisites

1. Push your code to a GitHub repository.
2. Sign up for Railway at [railway.app](https://railway.app).

### Backend Deployment

1. **Create a new Railway project**:
   - Go to Railway dashboard and click "New Project".
   - Choose "Deploy from GitHub repo".
   - Select your repository and set the root directory to `backend`.

2. **Add PostgreSQL database**:
   - In your Railway project, add a "PostgreSQL" plugin.
   - Railway will provide a `DATABASE_URL` environment variable automatically.

3. **Set environment variables**:
   - In Railway project settings > Variables, add:
     - `SECRET_KEY`: Generate a secure key (e.g., `openssl rand -hex 32`)
     - `DEBUG`: `False`
     - `ALLOWED_HOSTS`: Your Railway app URL (e.g., `your-app.up.railway.app`)
     - `CORS_ALLOWED_ORIGINS`: `https://your-frontend-app.up.railway.app` (update after frontend deploy)

4. **Deploy**:
   - Railway will automatically detect Python and install from `requirements.txt`.
   - It will run `python manage.py migrate` on first deploy.
   - Your backend will be available at `https://your-backend-service.up.railway.app`.

### Frontend Deployment

1. **Add another service to the same project**:
   - In your Railway project, click "New" > "Service".
   - Choose "Static Site" or "Deploy from GitHub repo" with root directory `frontend`.

2. **Configure build settings**:
   - **Build Command**: `npm run build`
   - **Publish Directory**: `dist` (Vite's default build output)
   - **Install Command**: `npm install`

3. **Set environment variable** (optional):
   - If needed, set `NODE_ENV=production`.

4. **Update API URL**:
   - After both are deployed, update `frontend/src/api.js`:
     ```javascript
     const API_URL = "https://your-backend-service.up.railway.app/api";
     ```
   - Or, use Railway's internal networking: `API_URL = "http://backend:8000/api"` (if services are in same project).

5. **Deploy**:
   - Railway will build and deploy the frontend.
   - Your frontend will be available at `https://your-frontend-service.up.railway.app`.

### Final Steps

- Update CORS settings in backend if needed.
- Test the full app by accessing the frontend URL.
- Monitor logs in Railway dashboard for any issues.

### Alternative: Railway Deployment

- Deploy the backend on Railway with a Postgres database.
- Set `DATABASE_URL`, `SECRET_KEY`, `DEBUG`, and `CORS_ALLOWED_ORIGINS` in Railway.
- Frontend can be deployed separately with Vite or hosted on the same Railway project using static hosting.
