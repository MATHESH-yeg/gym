# OLIVA Fitness SaaS Backend

Enterprise-level backend for the OLIVA Fitness Platform.

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL (v14+)

### 2. Installation
```bash
cd server
npm install
```

### 3. Database Setup
1. Create a database named `oliva_db` in PostgreSQL.
2. Update `.env` with your credentials:
   ```
   DATABASE_URL=postgres://your_user:your_password@localhost:5432/oliva_db
   ```
3. Initialize the schema:
   ```bash
   npm run db:init
   ```

### 4. Running the App
```bash
# Development mode
npm run dev

# Production mode
npm start
```

## 🏗️ Core Architecture

- **Multi-Tenant**: Scoped by `brand_id`.
- **RBAC**: Strict role checks for Admins, Trainers, and Members.
- **Workout Logic**: Dedicated workflows for Assigned Workouts vs. Personal Plans.

## 📡 API v1 Endpoints

### Auth
- `POST /api/v1/auth/register-master` - Register Gym Brand + Admin
- `POST /api/v1/auth/login` - Universal Login

### Invites (Admin Only)
- `POST /api/v1/invites/generate` - Create trainer invite code
- `POST /api/v1/invites/register-trainer` - Join using invite code

### Workouts
- `POST /api/v1/workouts/assign` - Assign routine to member (Trainer/Admin)
- `POST /api/v1/plans` - Create personal plan (Member)
- `GET /api/v1/workouts/assigned/me` - Fetch my assigned routines

### Sessions
- `POST /api/v1/sessions/start` - Open a workout session
- `POST /api/v1/sessions/:id/log` - Log an individual set
- `POST /api/v1/sessions/:id/finish` - Close session with summary
