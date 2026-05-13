# TaskFlow - Task Management Dashboard

A modern, full-stack task management application with real-time updates, user authentication, and a responsive Kanban board interface.

**Live Demo:** [https://taskflow.jettyjaaaaa.space](https://taskflow.jettyjaaaaa.space)

---

## 📋 Table of Contents

- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Features](#features)
- [Prerequisites](#prerequisites)
- [Quick Start](#quick-start)
- [Project Structure](#project-structure)

---

## 🛠 Tech Stack

### Frontend
- **Framework:** React 18 with Vite
- **Build Tool:** Vite (HMR, optimized builds)
- **Styling:** Tailwind CSS + PostCSS
- **State Management:** Zustand
- **Icons:** Lucide React
- **HTTP Client:** Fetch API with custom wrapper
- **Real-time:** Supabase Realtime subscriptions
- **Deployment:** Vercel

### Backend
- **Runtime:** Node.js (Express.js)
- **Database:** Supabase (PostgreSQL)
- **Authentication:** JWT (JSON Web Tokens)
- **CORS:** Express CORS middleware
- **Environment:** dotenv
- **Deployment:** Render

### Database & Services
- **Database:** Supabase PostgreSQL
- **Authentication Service:** Supabase (Auth + custom JWT)
- **Real-time Sync:** Supabase Postgres Changes
- **Docker:** Multi-container orchestration (local dev)

---

## 🏗 Architecture

### System Design

```
┌─────────────────────────────────────────────────────────────────┐
│                         TaskFlow System                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌──────────────────────┐          ┌──────────────────────┐     │
│  │   FRONTEND (Vercel)  │          │  BACKEND (Render)    │     │
│  │  - React + Vite      │◄────────►│  - Express.js        │     │
│  │  - Zustand State     │   REST   │  - JWT Auth          │     │
│  │  - Tailwind UI       │   API    │  - CORS Enabled      │     │
│  └──────────────────────┘  /api/*  └──────────────────────┘     │
│           │                                   │                 │
│           │ Supabase                          │ Supabase        │
│           │ Realtime                          │ Service Role    |
│           └──────────────┬──────────────────┬─┘                 │
│                          │                  │                   │
│                   ┌──────▼──────────────────▼─────┐             │
│                   │  Supabase PostgreSQL Database │             │
│                   │  - users table                │             │
│                   │  - tasks table                │             │
│                   │  - task_assignments table     │             │
│                   │  - Realtime subscriptions     │             │ 
│                   └───────────────────────────────┘             │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

### Request Flow

**Login:**
1. User submits email + password on frontend
2. Frontend calls `POST /api/auth/login`
3. Backend queries `users` table in Supabase by email + password
4. If match found, backend generates JWT token (7-day expiry)
5. Frontend stores token in localStorage
6. Subsequent requests include `Authorization: Bearer <token>` header

**Task Operations:**
1. Frontend sends request with JWT token
2. Backend validates JWT signature and expiry
3. If valid, backend queries/updates Supabase database
4. Supabase broadcast changes via `postgres_changes` event
5. Frontend subscribed to channel receives real-time update

---

## ✨ Features

### Core Features

#### 1. **User Authentication**
- Email + password login with JWT tokens
- Persistent session storage (localStorage)
- Token validation on page load
- Auto-logout on invalid/expired token
- Role-based user model (admin/member)

#### 2. **Kanban Board**
- **Columns:** To Do, In Progress, Done
- **Task Cards:** Title, description, priority, progress bar, due date, assigned users
- **Drag & Drop:** Drag tasks between columns (integrated with state)
- **Visual Indicators:** Priority colors, progress badges, avatars

#### 3. **Task Management**
- Create new tasks with title, description, project, priority, due date
- Update task status (To Do → In Progress → Done)
- Update progress percentage (0-100%)
- Delete tasks
- Assign multiple users per task
- Filter & search tasks

#### 4. **Real-time Collaboration**
- Live task updates across browser tabs/users
- Supabase Postgres Changes subscription
- Instant UI sync when tasks change
- Live user presence awareness

#### 5. **User Management**
- View all registered users
- User profiles with avatars (Pravatar API)
- Role assignment (admin/member)
- Task assignment to users

#### 6. **UI/UX**
- Dark mode toggle (persisted in localStorage)
- Responsive design (mobile-friendly)
- Loading skeletons for better perceived performance
- Modal dialogs (Create task, Task detail, User management)
- Sidebar navigation with collapsible menu

---

## 📋 Prerequisites

### System Requirements
- **Node.js:** >= 16.x
- **npm/yarn:** Latest version
- **Docker & Docker Compose:** For local multi-container development
- **Git:** For version control

### External Services
- **Supabase Account:** PostgreSQL database + Realtime API
  - Project URL: `https://<project-ref>.supabase.co`
  - Anon Key: Public API key
  - Service Role Key: Admin API key (for backend)
- **Vercel Account:** (for frontend deployment)
- **Render Account:** (for backend deployment)

### Environment Setup

**Local Development (.env):**
```env
# Backend
BACKEND_HOST_PORT=5001
PORT=5000
FRONTEND_URL=http://localhost:5173
JWT_SECRET=<your-secure-random-string>

# Frontend
VITE_API_URL=http://localhost:5001/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>

# Supabase Credentials
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

**Production (Vercel Frontend):**
```env
VITE_API_URL=https://taskflow-backend.onrender.com/api
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=<your-anon-key>
```

**Production (Render Backend):**
```env
PORT=5000
FRONTEND_URL=https://taskflow.jettyjaaaaa.space
JWT_SECRET=<your-secure-random-string>
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
```

---

## 🚀 Quick Start

### Local Development

#### 1. Clone & Install
```bash
git clone <repository-url>
cd TaskFlow-test

# Install backend
cd backend && npm install && cd ..

# Install frontend
cd frontend && npm install && cd ..
```

#### 2. Environment Setup
```bash
# Copy .env.example to .env and fill in Supabase credentials
cp .env.example .env
```

#### 3. Database Setup
```bash
# Create tables in Supabase via SQL editor or use seed script
psql -f database/schema.sql <connection-string>
psql -f database/seed.sql <connection-string>
```

#### 4. Run with Docker Compose
```bash
docker-compose up --build
```

Or run separately:
```bash
# Terminal 1: Backend
cd backend
npm run dev

# Terminal 2: Frontend
cd frontend
npm run dev
```

#### 5. Access App
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api
- Demo credentials: `user1@taskflow.com / password123`

---

## 📁 Project Structure

```
TaskFlow-test/
├── frontend/                 # React + Vite frontend
│   ├── src/
│   │   ├── components/       # React components
│   │   │   ├── Dashboard.jsx
│   │   │   ├── KanbanColumn.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   ├── Modal.jsx
│   │   │   └── ...
│   │   ├── pages/           # Page components
│   │   │   ├── LoginPage.jsx
│   │   │   └── Dashboard.jsx
│   │   ├── lib/             # Utilities
│   │   │   ├── api.js       # API client wrapper
│   │   │   ├── supabase.js  # Supabase client
│   │   │   └── avatar.js    # Avatar utility
│   │   ├── store/           # State management
│   │   │   └── useStore.js  # Zustand store
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── vite.config.js
│   ├── tailwind.config.js
│   ├── package.json
│   └── index.html
│
├── backend/                  # Express.js backend
│   ├── src/
│   │   ├── routes/          # API routes
│   │   │   ├── auth.js      # Login, token validation
│   │   │   ├── tasks.js     # Task CRUD
│   │   │   └── users.js     # User management
│   │   ├── middleware/      # Express middleware
│   │   │   └── auth.js      # JWT verification
│   │   ├── lib/             # Utilities
│   │   │   └── supabase.js  # Supabase client
│   │   └── index.js         # Express app entry
│   ├── Dockerfile
│   ├── package.json
│   └── .env
│
├── database/                 # SQL scripts
│   ├── schema.sql           # Table definitions
│   └── seed.sql             # Demo data
│
├── docker-compose.yml       # Multi-container orchestration
├── .env                     # Local environment variables
├── .gitignore
└── README.md               # This file
```

---

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - Login with email + password
- `GET /api/auth/me` - Get current user (requires JWT)

### Tasks
- `GET /api/tasks` - List tasks with filters
- `GET /api/tasks/:id` - Get single task
- `POST /api/tasks` - Create task (requires JWT)
- `PUT /api/tasks/:id` - Update task (requires JWT)
- `DELETE /api/tasks/:id` - Delete task (requires JWT)

### Users
- `GET /api/users` - List all users
- `GET /api/users/:id` - Get single user

### Health
- `GET /api/health` - Health check

---

## 📄 License

This project is open source.
