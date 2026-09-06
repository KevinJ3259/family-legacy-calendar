# Family Legacy Calendar

Family Legacy Calendar is a full-stack web application designed to help families preserve important memories, birthdays, events, and photographs across generations.

The application combines a traditional family calendar with digital family-history features, allowing each authenticated family to maintain its own private collection of members, events, birthdays, and monthly photo memories.

## Live Application

**Live Demo:**  
https://family-legacy-calendar-frontend.onrender.com

**Backend API:**  
https://family-legacy-calendar.onrender.com

**GitHub Repository:**  
https://github.com/KevinJ3259/family-legacy-calendar

## Features

- Secure user registration and login
- JWT-based authentication
- Separate family data for each authenticated user
- Add, edit, and delete family members
- Automatically display family birthdays on the calendar
- Calculate the age a family member will turn each year
- Add, edit, and delete family events
- Display birthdays and events directly on calendar dates
- Navigate across 100 years of calendar dates
- Select individual months and years
- Upload monthly family photographs
- Add one or multiple photographs to each month
- Store up to six photos per month
- Automatic photo collage layouts
- Support for pre-made photo collages
- Manage and delete individual monthly photos
- Persistent photo storage in production
- Responsive calendar interface
- Print-friendly family calendar
- User-specific photo and calendar data
- Production PostgreSQL database

## Automatic Photo Layouts

Family Legacy Calendar automatically adjusts the monthly photo display based on the number of photographs selected.

- 1 photo — large centered photograph
- 2 photos — side-by-side layout
- 3 photos — one large photo with two stacked photos
- 4 photos — 2 × 2 collage
- 5–6 photos — multi-column collage

This allows each calendar month to function as both a traditional calendar and a visual family memory page.

## Tech Stack

### Frontend

- React
- TypeScript
- Vite
- CSS
- Fetch API

### Backend

- Python
- FastAPI
- SQLAlchemy
- Pydantic
- JWT authentication
- Uvicorn

### Database

- PostgreSQL — production
- SQLite — local development

### Deployment

- Render Web Service — FastAPI backend
- Render Static Site — React frontend
- Render PostgreSQL — production database
- Render Persistent Disk — uploaded family photographs

## Application Architecture

```text
React + TypeScript Frontend
          |
          | REST API
          v
    FastAPI Backend
       /       \
      v         v
PostgreSQL   Persistent
 Database    Photo Storage
```

The backend handles authentication, family members, birthdays, family events, monthly photos, image uploads, and user-specific data access.

## Project Structure

```text
family-legacy-calendar/
│
├── backend/
│   ├── auth.py
│   ├── database.py
│   ├── main.py
│   ├── models.py
│   ├── schemas.py
│   ├── requirements.txt
│   └── uploads/
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── App.css
│   │   ├── App.tsx
│   │   ├── index.css
│   │   └── main.tsx
│   ├── package.json
│   └── vite.config.ts
│
└── README.md
```

## Running the Project Locally

### Backend

Navigate to the backend directory:

```bash
cd backend
```

Activate the Python virtual environment.

Windows Git Bash:

```bash
source venv/Scripts/activate
```

Start the FastAPI server:

```bash
uvicorn main:app --reload
```

The backend runs locally at:

```text
http://127.0.0.1:8000
```

FastAPI API documentation is available at:

```text
http://127.0.0.1:8000/docs
```

### Frontend

Open another terminal and navigate to the frontend directory:

```bash
cd frontend
```

Install dependencies if necessary:

```bash
npm install
```

Start the Vite development server:

```bash
npm run dev
```

The frontend normally runs at:

```text
http://localhost:5173
```

## Authentication and Data Isolation

Family Legacy Calendar uses JWT-based authentication.

Protected backend routes require an authenticated user. Family members, events, birthdays, and photo records are associated with the authenticated user's account, helping prevent one account from accessing another account's family information.

## Production Infrastructure

The production application uses separate frontend, backend, database, and persistent-storage components.

The React frontend communicates with the FastAPI backend through a REST API. The backend stores application data in PostgreSQL, while uploaded photographs are stored on persistent storage so they remain available across deployments.

Environment variables are used for production configuration and sensitive values rather than storing credentials directly in the source code.

## Purpose

Family Legacy Calendar was created to explore how software can help preserve family history in an interactive format.

Instead of storing birthdays, events, and photographs in separate applications, the project brings them together into a calendar that can grow with a family over time.

The project also demonstrates full-stack development concepts including authentication, REST APIs, relational databases, file uploads, persistent storage, responsive frontend development, production configuration, and cloud deployment.

## Future Enhancements

Potential future improvements include:

- Family invitations and shared family accounts
- Family relationships and family-tree visualization
- Anniversary and memorial reminders
- Additional calendar customization
- PDF/calendar export
- Additional mobile optimization
- Cloud object storage for larger-scale photo collections
- Email or push notifications for upcoming family events

## Author

**Kevin Jordan**

Full Stack Software Developer

GitHub: KevinJ3259
