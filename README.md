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

6. **Production-Ready Multi-Cloud Architecture**
   - **Backend API on Render**: Node.js + Express with managed PostgreSQL database.
   - **Frontend on Vercel**: High-speed React + Vite Single Page Application with automated asset caching and SPA rewrites.
   - Bulletproof CORS handling and API URL auto-normalization.

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
│   │   └── server.js             # Express app, CORS, 0.0.0.0 binding
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── api/
│   │   │   └── client.js         # API client with bulletproof URL normalization
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
│   ├── .env.example
│   ├── index.html
│   ├── package.json
│   ├── vercel.json               # Vercel SPA routing & caching configuration
│   └── vite.config.js
├── .env.example                  # Environment configuration template
├── .gitignore                    # Excludes node_modules, build files, and secrets
├── package.json                  # Root npm scripts to run both client and server
├── render.yaml                   # Infrastructure blueprint for Render backend + DB
├── vercel.json                   # Root fallback Vercel configuration
└── README.md                     # Documentation
```

---

## 🚀 Quick Start (Local Development)

### 1. Prerequisites
- **Node.js**: v18.0.0 or higher (`node -v`)
- **npm**: v9.0.0 or higher (`npm -v`)
- *(Optional)* PostgreSQL running locally or a cloud database URL (e.g., from Render, Neon, or Supabase).

### 2. Clone and Install Dependencies
In the root directory, run:
```bash
npm run install:all
```
This installs dependencies in root, `/backend`, and `/frontend` simultaneously.

### 3. Configure Environment Variables (Optional)
Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```
*(If you leave `DATABASE_URL` empty, the backend automatically uses persistent local storage at `backend/data/tasks-db.json` so you can start right away).*

### 4. Start Development Server
Run:
```bash
npm run dev
```
This command starts:
- **Backend API Server**: [`http://localhost:5001`](http://localhost:5001)
- **Frontend Vite Client**: [`http://localhost:5173`](http://localhost:5173) (proxies `/api` requests to port 5001)
- **Health Check Endpoint**: [`http://localhost:5001/api/health`](http://localhost:5001/api/health)

---

## 🛠️ Testing Production Build Locally

You can test the exact production build locally:

```bash
# 1. Build the React frontend
npm run build

# 2. Start the backend server
npm start
```

---

## 📡 REST API Reference

| Method | Endpoint | Description |
| :--- | :--- | :--- |
| `GET` | `/api/health` | Health-check endpoint returning server uptime, environment, and PostgreSQL connection status |
| `GET` | `/api/tasks` | Retrieve tasks. Supports `?status=pending\|completed`, `?search=...`, `?subject=...`, `?priority=High\|Medium\|Low`, `?sortBy=due_date\|priority\|title`, `?sortOrder=asc\|desc` |
| `GET` | `/api/tasks/counts` | Summary counts of total, pending, and completed tasks |
| `GET` | `/api/tasks/:id` | Retrieve a single task by ID |
| `POST` | `/api/tasks` | Create a new task (validates `title`, `subject`, `due_date`, `priority`) |
| `PUT` | `/api/tasks/:id` | Update an existing task |
| `PATCH` | `/api/tasks/:id/toggle` | Toggle completion status |
| `DELETE` | `/api/tasks/:id` | Delete a task |
| `POST` | `/api/tasks/seed` | Populate or reset sample demo assignments |

---

## 🌐 Production Deployment Guide

This project is configured for **Backend + Database on Render** and **Frontend on Vercel**.

```
┌─────────────────────────┐          REST API Calls           ┌────────────────────────────────┐
│   Vercel Frontend SPA   │ ────────────────────────────────> │     Render Node.js Backend     │
│ (student-planner.vercel)│ <──────────────────────────────── │ (student-planner-api.onrender) │
└─────────────────────────┘      CORS Enabled (*.vercel.app)  └───────────────┬────────────────┘
                                                                              │
                                                                              ▼
                                                              ┌────────────────────────────────┐
                                                              │   Render PostgreSQL Database   │
                                                              │      (student-planner-db)      │
                                                              └────────────────────────────────┘
```

---

### Step 1: Deploy Backend & PostgreSQL to Render

You can deploy using Render's automated Blueprint or manually through the Render Dashboard.

#### Option A: Using Render Blueprint (`render.yaml`)
1. Push your repository to GitHub: `https://github.com/24eg105j61-hash/my-fullstack-app`
2. Go to your [Render Dashboard](https://dashboard.render.com/).
3. Click **New +** → **Blueprint**.
4. Select `24eg105j61-hash/my-fullstack-app`.
5. Render detects [`render.yaml`](render.yaml) and automatically provisions:
   - **PostgreSQL Database:** `student-planner-db`
   - **Web Service:** `student-planner-api` with `DATABASE_URL` linked automatically.
6. Click **Apply**.
7. Once deployed, note your Render Backend URL (e.g., `https://student-planner-api.onrender.com`).
8. Verify by opening `https://<YOUR-RENDER-BACKEND-URL>/api/health`.

#### Option B: Manual Render Service Setup
1. **Create PostgreSQL Database:**
   - In Render Dashboard, click **New +** → **PostgreSQL**.
   - Name: `student-planner-db`
   - Database: `student_planner`
   - User: `student_admin`
   - Region: `Oregon` (or closest to you)
   - Click **Create Database**.
   - Once provisioned, copy the **Internal Database URL** (or External Database URL).
2. **Create Web Service:**
   - Click **New +** → **Web Service**.
   - Connect your GitHub repository: `24eg105j61-hash/my-fullstack-app`.
   - **Name:** `student-planner-api`
   - **Root Directory:** `backend`
   - **Environment:** `Node`
   - **Build Command:** `npm install`
   - **Start Command:** `npm start`
   - **Environment Variables:**
     - `NODE_ENV`: `production`
     - `PORT`: `10000`
     - `DATABASE_URL`: *(paste the PostgreSQL connection string from step 1)*
     - `CLIENT_URL`: `*` (or your Vercel URL once deployed)
   - Click **Deploy Web Service**.

---

### Step 2: Deploy Frontend to Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **Add New...** → **Project**.
3. Import your GitHub repository: `24eg105j61-hash/my-fullstack-app`.
4. In the **Configure Project** screen:
   - **Project Name:** `student-planner`
   - **Framework Preset:** `Vite`
   - **Root Directory:** Click *Edit* and select **`frontend`**
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `dist` (default)
5. **Environment Variables:**
   - Add **`VITE_API_BASE_URL`**:
     ```text
     https://<YOUR-RENDER-BACKEND-URL>/api
     ```
     *(Example: `https://student-planner-api.onrender.com/api`)*
6. Click **Deploy**.
7. Vercel will build and deploy your application to a URL like `https://student-planner-xxx.vercel.app`.

---

### Step 3: Verify the Live Deployment
1. Open your live Vercel URL: `https://<YOUR-APP>.vercel.app`.
2. Check the **DB Badge** in the top navigation: it should display **DB: PostgreSQL**.
3. Add a new task (e.g. "Prepare Final Presentation", "Computer Science", Due Tomorrow, Priority: High).
4. Verify task appears, click the checkbox to complete it, and edit or delete it.
5. Refresh the browser page: all changes persist directly in your PostgreSQL database!

---

## 🔑 Environment Variables Reference

### Backend (Render)
| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `PORT` | Port to bind server | `10000` (Render sets automatically) |
| `NODE_ENV` | Runtime environment | `production` |
| `DATABASE_URL` | PostgreSQL connection string with SSL | `postgresql://user:pass@ep-host.render.com/student_planner` |
| `CLIENT_URL` | Allowed frontend origin for CORS | `https://student-planner.vercel.app` or `*` |

### Frontend (Vercel)
| Variable | Description | Example Value |
| :--- | :--- | :--- |
| `VITE_API_BASE_URL` | Deployed backend API base URL | `https://student-planner-api.onrender.com/api` |

---

## 🔒 Security Best Practices
- `.env` files and credentials are excluded from Git via `.gitignore`.
- Production PostgreSQL connections use SSL with `rejectUnauthorized: false` for secure cloud database handshakes.
- CORS is configured to strictly permit your Vercel frontend, preventing unauthorized cross-origin abuse.
- Input validation on all REST endpoints blocks SQL injection and malformed payloads.
