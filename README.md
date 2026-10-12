# FreeLance Tracker - Frontend

A modern, responsive React web application for freelance project management, task breakdown, time logging, and invoice revenue calculations.

## 🚀 Tech Stack

- **Framework**: [React 19](https://react.dev/) + [Vite](https://vitejs.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/)
- **Routing**: [React Router v7](https://reactrouter.com/)
- **API Client**: [Axios](https://axios-http.com/)
- **Icons**: [Lucide React](https://lucide.dev/)

---

## 📋 Prerequisites

Before running the frontend application, ensure you have installed:
- **Node.js**: v18.0.0 or higher (v20+ recommended)
- **npm**: v9.0.0 or higher

---

## 🛠️ Installation & Setup

1. **Navigate to the frontend folder**:
   ```bash
   cd d:\ProjectManagment\frontend
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

   The app will run locally at `http://localhost:5173` (or the port Vite allocates).

---

## 🔗 Connecting to the Backend

The frontend communicates with the Freelancer Tracker backend service configured at:
```
http://localhost:3001
```

- **Authentication**: Managed via session cookies and Google OAuth (`POST /api/auth/google`, `POST /api/auth/logout`, and `GET /api/auth/verify`).
- **API routes**: Request URLs are centralized in `src/api/apiRoutes.js`.
- **Axios Configuration**: Pre-configured in `src/api/axiosClient.js` with `withCredentials: true`. Successful responses (including `200` and `201`) return their response body unchanged. API errors are surfaced through app-wide notifications; expired sessions clear the signed-in user and redirect to sign-in, while login `401`s, validation errors, permission errors, missing resources, Google outages, server failures, and network failures receive distinct guidance.
- **Not Found handling**: Unknown browser URLs show a branded `404` page. An API `404` remains on the current page and displays a resource-not-found notification; it does not prompt the user to sign in again.
- **Backend Endpoints**:
  - `POST /api/auth/google`: Verifies Google credentials and starts a session
  - `POST /api/auth/logout`: Destroys the user session
  - `GET /api/auth/verify`: Checks session authentication
  - `GET /api/projects`: Fetches user projects list
  - `POST /api/projects`: Creates a new project
  - `GET /api/projects/:projectId/tasks`: Fetches hierarchical tasks for a project
  - `POST /api/clients`: Creates a new client
  - `GET /api/clients`: Fetches client list
  - `POST /api/tasks`: Creates a task or subtask (`parent_task_id`)
  - `PATCH /api/tasks/:taskId`: Updates task completion status
  - `POST /api/time-logs`: Logs work duration (hours) against a task
  - `GET /api/time-logs/task/:taskId`: Retrieves time logs for a task

---

## 📁 Project Structure

```
frontend/
├── index.html
├── package.json
├── vite.config.js
├── README.md
└── src/
    ├── api/
    │   └── axiosClient.js          # Preconfigured Axios instance with credentials & interceptor
    ├── components/
    │   ├── auth/
    │   │   └── LoginButton.jsx     # Google OAuth sign-in button
    │   ├── common/
    │   │   ├── LoadingSpinner.jsx  # Reusable animated spinner
    │   │   └── Modal.jsx           # Accessible modal popup dialog
    │   ├── dashboard/
    │   │   ├── ProjectTable.jsx    # Projects table with statuses and revenue metrics
    │   │   └── StatsCards.jsx      # High-level freelance metric overview cards
    │   ├── layout/
    │   │   └── Navbar.jsx          # Sticky header with navigation and user avatar
    │   └── tasks/
    │       └── TaskTree.jsx        # Hierarchical collapsible task tree with inline actions
    ├── context/
    │   └── AuthContext.jsx         # Context provider for user auth state
    ├── pages/
    │   ├── DashboardPage.jsx       # Overview dashboard with client/project creation modals
    │   ├── LoginPage.jsx           # Landing page with hero section and OAuth CTA
    │   └── ProjectDetailPage.jsx   # Detailed project workspace with task tree & time logger
    ├── App.jsx                     # Route declarations and ProtectedRoute wrapper
    ├── main.jsx                    # React entry root
    └── index.css                   # Tailwind CSS root stylesheet
```

---

## 📦 Building for Production

To create an optimized production build:

```bash
npm run build
```

To preview the production build locally:

```bash
npm run preview
```
