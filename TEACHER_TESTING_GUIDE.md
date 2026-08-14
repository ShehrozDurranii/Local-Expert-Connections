# 🎓 ExpertConnect: Teacher & Evaluator Testing Guide

This guide provides step-by-step instructions for installing, configuring, running, and evaluating the **Local Expert-Connect (Buyer Portal)** full-stack web application.

---

## 📌 Repository Information

- **GitHub Repository URL**: [https://github.com/ShehrozDurranii/Local-Expert-Connections](https://github.com/ShehrozDurranii/Local-Expert-Connections)
- **Tech Stack**: Next.js 16 (App Router), Express.js REST API, MySQL Database, Tailwind CSS v4, React Hook Form + Zod, Axios, Sonner.

---

## ⚡ Quick Setup & Execution (5 Minutes)

### Step 1: Clone Repository
```bash
git clone https://github.com/ShehrozDurranii/Local-Expert-Connections.git
cd Local-Expert-Connections
```

### Step 2: Environment Configuration (`.env`)
Create `.env` files from `.env.example` templates:

```bash
# Backend Environment Setup
cp backend/.env.example backend/.env

# Frontend Environment Setup
cp frontend/.env.example frontend/.env.local
```

#### Backend `.env` parameters:
```env
PORT=5000
DB_HOST=localhost
DB_PORT=3306
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=expertconnect_db
JWT_SECRET=super_secret_jwt_key_expertconnect_2026
```

#### Frontend `.env.local` parameters:
```env
NEXT_PUBLIC_API_URL=http://localhost:5000
```

---

### Step 3: Database Initialization (MySQL)
Import the MySQL schema & sample seed data:

```bash
# Log in to MySQL and run:
mysql -u root -p < Documents/"expertconnect_buyer_schema claude.sql"
mysql -u root -p < Documents/"expertconnect_buyer_data Claude.sql"
```

---

### Step 4: Install Dependencies & Run Application

#### A. Start Express Backend Server (Port 5000)
```bash
cd backend
npm install
npm run dev
```
*Backend runs live at `http://localhost:5000`*

#### B. Start Next.js Frontend Dev Server (Port 3000)
Open a new terminal window:
```bash
cd frontend
npm install
npm run dev
```
*Frontend runs live at `http://localhost:3000`*

---

## 🧪 Buyer Portal Evaluation Checklist & Key Routes

Open **`http://localhost:3000`** in any modern web browser to evaluate the complete end-to-end Buyer Portal:

| Route | Feature Area | Evaluation Points |
|---|---|---|
| **`/`** | **Landing Page** | Hero section, Category Grid, How it Works, Testimonials, Footer navigation |
| **`/register`** | **Registration** | Zod form validation (Name, Email, Phone, Password), T&C checkbox, JWT token generation |
| **`/login`** | **Authentication** | Email & Password authentication, JWT Bearer storage in `localStorage` |
| **`/dashboard`** | **Buyer Dashboard** | KPI Metrics (Total Requests, Active Requests, Offers, Completed), Quick Action CTA, Recent requests |
| **`/requests`** | **Service Requests** | Search & status filter tabs (`All`, `Submitted`, `In Progress`, `Completed`), Pagination |
| **`/requests/create`** | **Create Request** | Multi-field form (Title, Category, City, Budget in PKR, Deadline picker, Description), Submission |
| **`/requests/[id]`** | **Request & Offers** | Request summary card, Status badge, Received Expert Proposals with **Accept / Decline** CTAs |
| **`/offers`** | **Offers Feed** | Centralized proposals overview linked directly to service requests |
| **`/notifications`** | **Notifications** | Unread pill badge (`2 New`), Filter tabs (`All`, `Unread`), Mark all as read button |
| **`/profile`** | **Buyer Profile** | Initials avatar badge, Name, Verified Email/Phone, Languages & Contact preferences form |
| **`/settings`** | **Settings** | Notification channel toggles, Mandatory security alert lock (`FR-NOTIF-02`), Password update |

---

## 🛠️ Automated Production Verification Commands

To verify zero compilation errors or lint failures:

```bash
# 1. Run Production Build Verification (Frontend)
cd frontend
npm run build

# 2. Run Code Linter & Prettier Check
npm run lint
```
*Result: 12 static/dynamic routes compiled in < 5 seconds with 0 errors.*
