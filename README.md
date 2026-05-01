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

## Deployment

- Deploy the backend on Railway with a Postgres database.
- Set `DATABASE_URL`, `SECRET_KEY`, `DEBUG`, and `CORS_ALLOWED_ORIGINS` in Railway.
- Frontend can be deployed separately with Vite or hosted on the same Railway project using static hosting.
