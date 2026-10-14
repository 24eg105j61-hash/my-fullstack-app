# 🎓 Student Planner — Full-Stack Academic Task & Deadline Manager

A complete, modern, responsive full-stack web application designed for students to track course assignments, homework, and exam deadlines with priorities, progress tracking, and persistent storage in PostgreSQL.

---

## 🌟 Key Features

1. **Modern Responsive Student Dashboard**
   - Sleek glassmorphic dark theme tailored for students.
   - Micro-interactions, animated stat cards, and dynamic urgency badges (*Due Today*, *Overdue*, *Tomorrow*, *In X days*).
   - Fully optimized for desktop, tablet, and mobile devices.

2. **Full Task Management (CRUD)**
   - **Create:** Add assignments with title, subject/course, due date, and priority level.
   - **Read:** Instant real-time view with search, subject filtering, and status filtering.
   - **Update / Edit:** Edit any task's details in a clean modal dialog.
   - **Toggle Completion:** One-click checkmark toggle with immediate optimistic UI update.
   - **Delete:** Safe removal with confirmation modal.

3. **Smart Filters & Statistics**
   - Filter by **All**, **Pending**, and **Completed** tasks.
   - Search by task title or course/subject name with instant live filtering.
   - Filter by specific Course/Subject or Priority (*High*, *Medium*, *Low*).
   - Dynamic summary metrics: Total Tasks, Pending Count, Completed Count, and Completion Rate % with progress bar.

4. **Dual-Mode Persistence (PostgreSQL + Local Fallback)**
   - Connects to **PostgreSQL** via `DATABASE_URL` (with SSL support for cloud databases like Render, Neon, Supabase, or AWS RDS).
   - Automatically executes safe schema initialization on startup (`CREATE TABLE IF NOT EXISTS tasks (...)`).
   - If `DATABASE_URL` is not provided locally, gracefully activates a local persistent file store (`backend/data/tasks-db.json`), ensuring development works out-of-the-box without requiring a local PostgreSQL daemon.

5. **Demo Data Generator**
   - One-click **Load Demo Data** button with clearly marked sample assignments across Mathematics, Chemistry, Computer Science, and History.

6. **Production-Ready Unified Architecture**
   - Express server serves both the production React frontend build and REST API routes from a single URL.
   - Handles SPA client-side routing refreshes.

---

## 📂 Project Structure

```text
my-fullstack-app/
├── backend/
│   ├── data/
│   │   └── tasks-db.json       # Local fallback persistent storage
│   ├── src/
│   │   ├── controllers/
│   │   │   └── tasksController.js # REST API business logic & input validation
│   │   ├── db/
│   │   │   ├── index.js          # PostgreSQL connection & fallback store logic
│   │   │   └── sampleData.js     # Clearly identified demo assignments
│   │   ├── routes/
│   │   │   ├── health.js         # /api/health endpoint
│   │   │   └── tasks.js          # /api/tasks endpoints
│   │   └── server.js             # Express app, static SPA serving, port binding
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js         # Fetch client for backend REST API
│   │   ├── components/
│   │   │   ├── DeleteConfirmModal.jsx
│   │   │   ├── EmptyState.jsx
│   │   │   ├── Navbar.jsx
│   │   │   ├── StatsOverview.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   ├── TaskFilterBar.jsx
│   │   │   ├── TaskModal.jsx
│   │   │   └── ToastNotification.jsx
│   │   ├── App.jsx               # Main dashboard component
│   │   ├── index.css             # Vanilla CSS design system & tokens
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   └── vite.config.js
├── .env.example                  # Root placeholder environment config
├── .gitignore                    # Excludes node_modules, build files, and secrets
├── package.json                  # Root npm scripts to run both client and server
├── render.yaml                   # Infrastructure blueprint for Render deployment
└── README.md                     # Documentation
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (`node -v`)
- **npm**: v9.0.0 or higher (`npm -v`)
- *(Optional)* PostgreSQL running locally or a cloud database URL (e.g., from Neon, Supabase, or Render).

### 2. Clone and Install Dependencies
In the root directory, run:
```bash
npm run install:all
```
This installs dependencies in the root, `/backend`, and `/frontend` simultaneously.

### 3. Configure Environment Variables (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(If you leave `DATABASE_URL` empty or unset, the application automatically uses local persistent storage so you can start coding right away).*

### 4. Start Development Server
Run:
```bash
npm run dev
```
This command starts both:
- **Backend API Server**: `http://localhost:5001`
- **Frontend Vite Client**: `http://localhost:5173` (proxies `/api` requests to port 5001)

Open your browser at:
👉 **`http://localhost:5173`**

---

## 🛠️ Testing Production Build Locally

You can test the exact production setup where Express serves the compiled React frontend from a single port:

```bash
# 1. Build the React frontend
npm run build

# 2. Start the unified production server
npm start
```
Open your browser at:
👉 **`http://localhost:5001`**

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health-check endpoint returning server uptime and database connectivity |
| `GET` | `/api/tasks` | Retrieve all tasks. Supports `?status=pending\|completed`, `?search=...`, `?subject=...`, `?priority=High\|Medium\|Low`, `?sortBy=due_date\|priority\|title`, `?sortOrder=asc\|desc` |
| `GET` | `/api/tasks/counts` | Summary counts of total, pending, and completed tasks |
| `GET` | `/api/tasks/:id` | Retrieve a single task by ID |
| `POST` | `/api/tasks` | Create a new task (validates `title`, `subject`, `due_date`, `priority`) |
| `PUT` | `/api/tasks/:id` | Update an existing task |
| `PATCH` | `/api/tasks/:id/toggle` | Toggle completion status |
| `DELETE` | `/api/tasks/:id` | Delete a task |
| `POST` | `/api/tasks/seed` | Populate or reset sample demo assignments |

---

## ☁️ Deployment Guide (Render)

This application is configured for seamless deployment on [Render](https://render.com) using either the included `render.yaml` Blueprint or manual web service creation.

### Option A: Deploy with Render Blueprint (Recommended)
1. Push your repository to **GitHub** or **GitLab**.
2. Log in to your [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** and select **Blueprint**.
4. Connect your repository. Render will automatically detect `render.yaml`.
5. Render will provision:
   - A **PostgreSQL Database** (`student-planner-db`)
   - A **Web Service** (`student-planner`) with `DATABASE_URL` linked automatically.
6. Click **Apply**. Once built, your app will be live at a public `https://student-planner-xxx.onrender.com` URL!

### Option B: Manual Web Service & PostgreSQL Setup
1. **Create PostgreSQL Database on Render:**
   - In Render Dashboard, click **New +** → **PostgreSQL**.
   - Name it `student-planner-db`, set database name `student_planner`, and click **Create Database**.
   - Copy the **Internal Database URL** (or External Database URL).
2. **Create Web Service on Render:**
   - Click **New +** → **Web Service**.
   - Connect your GitHub repository.
   - **Environment:** `Node`
   - **Build Command:** `npm run install:all && npm run build`
   - **Start Command:** `npm start`
   - **Environment Variables:**
     - `NODE_ENV`: `production`
     - `DATABASE_URL`: paste your PostgreSQL connection string from step 1.
3. Click **Deploy Web Service**.
4. The schema table will be automatically created on startup, and your live URL will serve both frontend and backend seamlessly!

---

## 🔒 Security Best Practices
- `.env` files and local secrets are excluded in `.gitignore`.
- Cloud PostgreSQL connections automatically use SSL mode (`rejectUnauthorized: false` for managed cloud certificates).
- Express runs on `0.0.0.0` and dynamically binds to the port provided by the host platform (`process.env.PORT`).
