# CareerConnect — MERN Stack Job & Internship Portal for Freshers

**CareerConnect** is a production-grade, full-stack MERN platform purpose-built for college students, fresh engineering graduates, and university campus recruiters. It bridges the transition from campus classrooms to engineering careers through transparent skill-matching, zero-noise entry-level listings, verified PDF resume workflows, and dedicated recruiter/admin dashboards.

---

## 🌟 Key Highlights & Features

### 👨‍🎓 For Students & Freshers
- **Discovery Engine**: Search and multi-filter across verified campus openings and summer internships (Work Mode, Employment Type, Experience Level, Minimum Compensation, Technical Skills, and Source).
- **Transparent Skill Match**: Real-time rule-based matching engine comparing your student profile skills against prerequisite job requirements with clear breakdown of matched vs. missing skills.
- **Dedicated Internships Discovery**: Filter specifically by Paid/Unpaid, duration (3-6 Months), stipends, and Pre-Placement Offer (PPO) potential.
- **Application Lifecycle**: Submit applications with verified PDF/Word resumes and notes; track status transitions (`Applied`, `Under Review`, `Shortlisted`, `Interview`, `Selected`, `Rejected`, `Withdrawn`) with full timeline logs.
- **Saved Opportunities**: Bookmark jobs to persistent database storage with instant status indicators.
- **In-App Notifications**: Real-time alerts when applications are reviewed, shortlisted, or scheduled for technical interview rounds.
- **Student Profile**: Education records, CGPA, graduation year, technical skills tags, GitHub/LinkedIn links, and secure Multer resume uploads (up to 5 MB with strict PDF/Word validation).

### 💼 For Recruiters & Campus Leads
- **Requisition Management**: Create, edit, pause, and delete fresher and internship listings.
- **Candidate Review**: View all candidate profiles applying to your specific requisitions with candidate education, graduation year, and skills tags.
- **Secure Resume Access**: Authorized download and inspection of candidate resumes.
- **Application Funnel Updates**: Update candidate stages with custom feedback notes, which automatically send in-app notifications to applicants.
- **Ownership Security**: Strict server-side role and ownership verification ensuring recruiters can only modify their own requisitions and applicants.

### 🛡️ For Administrators
- **Platform Analytics**: Total users, students, recruiters, active listings, external listings, internships, and total applications pipeline with Recharts graphs.
- **User Account Moderation**: Search registered accounts, filter by role, activate or suspend accounts, and permanently delete abusive users.
- **Job Moderation**: Close, reactivate, or remove flagged or spam listings.
- **Audit Logging**: Comprehensive audit trail of all moderation actions and security events.

### 🌐 External Provider Adapter Architecture (Unstop Integration)
- Includes provider adapter architecture for external platforms such as **Unstop**.
- Clearly distinguishes between:
  1. **Direct Verified CareerConnect Postings**: Handled internally with one-click resume submission and tracking.
  2. **External / Partner Feeds (Unstop)**: Clearly labeled with official provider badge, external redirection button ("Apply on Unstop"), and user disclaimer.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 18, Vite, React Router DOM v6, Tailwind CSS, Lucide React icons, Recharts, Axios |
| **Backend** | Node.js, Express.js, REST API architecture, JWT authentication, bcryptjs, Multer, Helmet, Express-Rate-Limit |
| **Database** | MongoDB, Mongoose ODM (Indexes, Schemas, Validations) |
| **Development** | npm, Postman Collection, Dotenv, Node.js v18+ |

---

## 📁 Repository Directory Structure

```text
careerconnect/
├── backend/
│   ├── src/
│   │   ├── config/          # MongoDB connection, constants, environment
│   │   ├── controllers/     # Auth, Profile, Jobs, Applications, SavedJobs, Admin, Notifications
│   │   ├── middleware/      # JWT auth, Multer upload, NoSQL injection sanitation, Error handler
│   │   ├── models/          # User, Job, Application, SavedJob, Notification, AuditLog
│   │   ├── routes/          # Express REST API routes
│   │   ├── scripts/         # Database seeding script & automated API test suite
│   │   ├── services/        # Transparent skill-match service & Unstop external adapter
│   │   ├── app.js           # Express app with security headers & rate limiting
│   │   └── server.js        # Server listener with graceful shutdown
│   ├── uploads/resumes/     # Secure disk storage for verified candidate resumes
│   ├── .env.example
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Navbar, Footer, JobCard, InternshipCard, SearchBar, FilterPanel, SkillMatchBadge, etc.
│   │   ├── context/         # AuthContext, ThemeContext (Dark/Light mode), NotificationContext
│   │   ├── pages/           # Home, Jobs, Internships, JobDetails, Login, Register, About, Companies, Notifications
│   │   │   ├── student/     # StudentDashboard, StudentProfile, StudentApplications, SavedJobsPage
│   │   │   ├── recruiter/   # RecruiterDashboard, PostJobPage, ManageJobsPage, ApplicantManagementPage
│   │   │   └── admin/       # AdminDashboard, UserManagementPage, JobModerationPage, AdminAuditLogsPage
│   │   ├── services/        # Axios API client with automatic JWT token interceptor
│   │   ├── App.jsx          # Route declarations & role-based route wrappers
│   │   ├── index.css        # Tailwind directives & theme base
│   │   └── main.jsx
│   ├── .env.example
│   ├── tailwind.config.js
│   ├── vite.config.js
│   └── package.json
├── careerconnect-api.postman_collection.json # Ready-to-import Postman test collection
├── .gitignore
└── README.md
```

---

## 🚀 Quickstart & Local Setup Guide

### 1. Prerequisites
- **Node.js** v18+ or v20+ installed (`node -v`)
- **MongoDB** running locally on port 27017 or a **MongoDB Atlas** connection string

### 2. Configure Environment Files

#### Backend (`backend/.env`):
```env
PORT=5000
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017/careerconnect
JWT_SECRET=careerconnect_super_secret_jwt_key_2026_production_grade_freshers
JWT_EXPIRES_IN=7d
CLIENT_URL=http://localhost:5173
```
*(For MongoDB Atlas, replace `MONGODB_URI` with your Atlas connection string `mongodb+srv://<user>:<password>@cluster0.mongodb.net/careerconnect?retryWrites=true&w=majority`).*

#### Frontend (`frontend/.env`):
```env
VITE_API_BASE_URL=/api
```

---

### 3. Install Dependencies

In backend directory:
```bash
cd backend
npm install
```

In frontend directory:
```bash
cd ../frontend
npm install
```

---

### 4. Seed Database with Rich Test Data

Run the database seed script to populate default users, internal requisitions (Google Cloud, Stripe), curated Unstop feeds, sample student applications, and notifications:

```bash
cd backend
npm run seed
```

---

### 5. Start the Application

#### Start Backend (Port 5000):
```bash
cd backend
npm run dev
```

#### Start Frontend (Port 5173):
```bash
cd frontend
npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

## 🔑 Demo & Test Credentials

The database seeder provisions verified test accounts across all three platform roles:

| Role | Email | Password | Details |
|---|---|---|---|
| **Student** | `student@demo.dev` | `Student@123` | Aarav Sharma (NIT CSE 2026, React/Node.js, full profile & resume) |
| **Recruiter 1** | `marcus@stripe.dev` | `Recruiter@123` | Marcus Vance (Senior Technical Recruiter at Stripe) |
| **Recruiter 2** | `sarah.jenkins@google.dev` | `Recruiter@123` | Sarah Jenkins (Talent Acquisition Lead at Google Cloud) |
| **Admin** | `admin@careerconnect.dev` | `Admin@123` | System Administrator (Full platform moderation access) |

*(Quick-fill buttons are also available on the Login page for one-click demonstration).*

---

## 🧪 Automated REST API Testing

An automated test script is included to verify all 15 core REST API routes end-to-end:

```bash
cd backend
npm run test:api
```

This verifies:
1. `GET /api/health` -> System health & uptime
2. `POST /api/auth/login` -> Student authentication
3. `POST /api/auth/login` -> Recruiter authentication
4. `POST /api/auth/login` -> Admin authentication
5. `GET /api/auth/me` -> Profile retrieval with completion % calculation
6. `GET /api/jobs` -> Job discovery with multi-filter & keyword search
7. `GET /api/jobs/:id` -> Single opportunity details & skill match calculation
8. `GET /api/jobs/student/recommendations` -> Transparent skill-matched recommendations
9. `GET /api/applications/my` -> Student application history tracking
10. `GET /api/applications/recruiter/all` -> Recruiter candidate applicant review
11. `PATCH /api/applications/:id/status` -> Recruiter candidate stage updates
12. `GET /api/saved-jobs` -> Saved bookmarks
13. `GET /api/notifications` -> In-app notifications & unread counts
14. `GET /api/admin/overview` -> Admin metrics & user management
15. Role-based authorization enforcement (403 Forbidden check)

---

## 🌐 Postman Collection

Import `careerconnect-api.postman_collection.json` into Postman. It contains preconfigured endpoints for Auth, Jobs, Applications, Saved Jobs, and Admin moderation with environment variables.

---

## 🚢 Production Deployment Instructions

### Frontend (Vercel)
1. Push repository to GitHub.
2. Connect repository on **Vercel**.
3. Set **Root Directory** to `frontend`.
4. Configure Environment Variable:
   - `VITE_API_BASE_URL`: `https://your-backend-domain.onrender.com/api`
5. Click **Deploy**.

### Backend (Render / Railway)
1. Create a **New Web Service** on Render.
2. Set **Root Directory** to `backend`.
3. Build Command: `npm install`
4. Start Command: `npm start`
5. Configure Environment Variables:
   - `PORT`: `5000`
   - `NODE_ENV`: `production`
   - `MONGODB_URI`: `<Your MongoDB Atlas Connection String>`
   - `JWT_SECRET`: `<Secure Random 64-character secret>`
   - `CLIENT_URL`: `https://your-frontend-app.vercel.app`
6. Click **Deploy**.

---

## 🛡️ Security Measures
- **bcryptjs**: Salt rounds of 10 for password hashing.
- **Role Verification**: Server-side checks on all protected endpoints (`authMiddleware.js`).
- **NoSQL Injection Sanitization**: Strips `$` and `.` operators from client request bodies.
- **Strict Multer File Validation**: Only `.pdf`, `.doc`, and `.docx` mime-types allowed; 5 MB size cap; sanitized randomized file naming to prevent path traversal.
- **Rate Limiting**: Express rate limit on sensitive login and register endpoints.
- **Secure Error Handling**: Stack traces suppressed in production mode.
