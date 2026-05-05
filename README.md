# TeamFlow — Team Task Manager

A full-stack web application for managing projects, assigning tasks, and tracking progress with role-based access control (Admin/Member).

## Live Demo

**Live URL:** _[Add your Railway URL here]_

## Features

- **Authentication** — Signup & Login with JWT-based auth
- **Project Management** — Create, update, delete projects
- **Team Collaboration** — Invite members by email, assign roles
- **Task Management** — Create, assign, and track tasks.
- **Role-Based Access Control** — Admin vs Member permissions
- **Dashboard** — Real-time stats, recent activity, overdue alerts
- **Responsive Design** — Works on desktop & mobile

## Tech Stack

| Layer | Technology |
|---|---|
| Backend | Node.js, Express.js |
| Database | MongoDB (Atlas) |
| ODM | Mongoose |
| Auth | JWT + bcryptjs |
| Frontend | React 18 (Vite) |
| State Management | Redux Toolkit + RTK Query |
| Routing | React Router v6 |
| Deployment | Railway |

## Project Structure

```
├── server.js              # Express entry point
├── config/db.js           # MongoDB connection
├── models/                # Mongoose schemas (User, Project, Task)
├── middleware/             # Auth & RBAC middleware
├── controllers/           # Route handlers
├── routes/                # API routes
├── validators/            # Input validation
└── client/                # React frontend
    ├── src/app/           # Redux store
    ├── src/features/      # Auth, Dashboard, Projects, Tasks
    └── src/components/    # Reusable UI components
```

## API Endpoints

### Auth
| Method | Route | Description |
|---|---|---|
| POST | `/api/auth/register` | Register new user |
| POST | `/api/auth/login` | Login |
| GET | `/api/auth/me` | Get current user |

### Projects
| Method | Route | Description |
|---|---|---|
| POST | `/api/projects` | Create project |
| GET | `/api/projects` | List my projects |
| GET | `/api/projects/:id` | Get project |
| PUT | `/api/projects/:id` | Update project (admin) |
| DELETE | `/api/projects/:id` | Delete project (admin) |
| POST | `/api/projects/:id/members` | Add member (admin) |
| DELETE | `/api/projects/:id/members/:userId` | Remove member (admin) |

### Tasks
| Method | Route | Description |
|---|---|---|
| POST | `/api/projects/:id/tasks` | Create task (admin) |
| GET | `/api/projects/:id/tasks` | List project tasks |
| GET | `/api/tasks/my` | My assigned tasks |
| PUT | `/api/tasks/:id` | Update task |
| DELETE | `/api/tasks/:id` | Delete task (admin) |

### Dashboard
| Method | Route | Description |
|---|---|---|
| GET | `/api/dashboard` | Get dashboard stats |

## Role-Based Access

| Action | Admin | Member |
|---|---|---|
| Create/edit/delete project | ✅ | ❌ |
| Add/remove members | ✅ | ❌ |
| Create/delete tasks | ✅ | ❌ |
| Assign tasks | ✅ | ❌ |
| Update task status | ✅ | ✅ (own only) |
| View project & tasks | ✅ | ✅ |

## Local Setup

1. **Clone the repo**
   ```bash
   git clone <repo-url>
   cd team-task-manager
   ```

2. **Create `.env`** from `.env.example`
   ```
   PORT=5000
   MONGODB_URI=your_mongodb_connection_string
   JWT_SECRET=your_secret_key
   JWT_EXPIRE=7d
   NODE_ENV=development
   ```

3. **Install & run**
   ```bash
   npm install
   cd client && npm install && cd ..
   # Terminal 1 — Backend
   node server.js
   # Terminal 2 — Frontend
   cd client && npm run dev
   ```

4. Open `http://localhost:3000`

## Railway Deployment

1. Push code to GitHub
2. Create a new project on [Railway](https://railway.app)
3. Connect your GitHub repo
4. Add environment variables in Railway dashboard:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `JWT_EXPIRE=7d`
   - `NODE_ENV=production`
5. Railway auto-deploys using `railway.json` config


## live link
https://ethara-assignment-production-0fbd.up.railway.app/
