# DRS Education Platform — Complete Setup Guide

## Architecture Overview
```
drs-education/
├── backend/          NestJS 10 + Mongoose + MongoDB
├── admin-panel/      Angular 17 + Metronic-style Admin UI
└── mobile-app/       Ionic 7 + Angular (iOS & Android)
```

---

## 1. Backend Setup (NestJS + MongoDB)

### Prerequisites
- Node.js 18+
- MongoDB 6+ (local) or MongoDB Atlas (cloud)

### Install & Run
```bash
cd backend
npm install
cp .env.example .env
```

Edit `.env`:
```env
# Local MongoDB
MONGODB_URI="mongodb://localhost:27017/drs_education"

# OR MongoDB Atlas
MONGODB_URI="mongodb+srv://username:password@cluster.xxxxx.mongodb.net/drs_education"

JWT_SECRET="generate-a-long-random-string"
JWT_REFRESH_SECRET="generate-another-long-random-string"
PORT=3000
```

```bash
# Seed the database with sample data
npm run seed

# Start development server
npm run start:dev
```

- **API Base URL**: `http://localhost:3000/api/v1`
- **Swagger Docs**: `http://localhost:3000/api/docs`

---

## 2. Admin Panel Setup (Angular 17)

```bash
cd admin-panel
npm install
ng serve
# Open: http://localhost:4200
```

### Production Build
```bash
ng build --configuration production
# Output: dist/drs-education-admin/
```

---

## 3. Mobile App Setup (Ionic 7)

```bash
cd mobile-app
npm install
ionic serve
# Open: http://localhost:8100
```

### Deploy to Device
```bash
ionic build
npx cap add android     # or ios
npx cap sync
npx cap run android     # or ios
```

---

## 4. Default Credentials (after seed)

| Role    | Email                              | Password      |
|---------|------------------------------------|---------------|
| Admin   | `admin@drseducation.in`            | `Admin@123`   |
| Teacher | `rajesh.patel@drseducation.in`     | `Teacher@123` |
| Student | `priya.sharma@student.in`          | `Student@123` |

---

## 5. API Reference

### Authentication
```
POST /api/v1/auth/login          { email, password }
POST /api/v1/auth/refresh        { refreshToken }
GET  /api/v1/auth/me             Bearer token required
POST /api/v1/auth/logout         Bearer token required
```

### All other endpoints require `Authorization: Bearer <token>`

| Module          | Base Path             | Operations |
|-----------------|-----------------------|------------|
| Classes         | `/api/v1/classes`     | CRUD + status toggle + student list |
| Subjects        | `/api/v1/subjects`    | CRUD |
| Videos          | `/api/v1/videos`      | CRUD + publish + featured + watch tracking |
| PDFs            | `/api/v1/pdfs`        | CRUD + publish |
| Students        | `/api/v1/students`    | CRUD + progress analytics |
| Teachers        | `/api/v1/teachers`    | CRUD |
| Announcements   | `/api/v1/announcements` | CRUD + publish |
| Quizzes         | `/api/v1/quizzes`     | CRUD + publish + attempt submission |
| Reports         | `/api/v1/reports`     | dashboard stats, top videos/students, subject engagement |

---

## 6. MongoDB Collections

| Collection        | Description |
|-------------------|-------------|
| `users`           | Admin, Teacher, Student user accounts |
| `refresh_tokens`  | JWT refresh tokens (auto-expires via TTL index) |
| `classes`         | Academic classes (Class 10, Class 11...) |
| `subjects`        | Subjects linked to classes and teachers |
| `teachers`        | Teacher profiles linked to users |
| `students`        | Student profiles with roll numbers |
| `videos`          | Video content with metadata |
| `video_watches`   | Per-student watch progress (upserted) |
| `pdfs`            | Study materials — notes, papers, solutions |
| `quizzes`         | Quizzes with embedded questions |
| `quiz_attempts`   | Student quiz attempt results |
| `announcements`   | Platform-wide announcements |

---

## 7. File Structure

```
backend/src/
├── main.ts                    # App bootstrap + Swagger
├── app.module.ts              # Root module
├── seed.ts                    # Sample data seeder
├── config/
│   └── mongoose.module.ts     # MongoDB connection
├── common/guards/             # JWT + Roles guards
├── schemas/                   # 11 Mongoose schemas
└── modules/
    ├── auth/                  # Login, refresh, logout
    ├── classes/               # Full CRUD + analytics
    ├── subjects/              # Full CRUD
    ├── videos/                # Upload + watch tracking
    ├── pdfs/                  # Materials management
    ├── students/              # Enrollment + progress
    ├── teachers/              # Staff management
    ├── announcements/         # Broadcast notices
    ├── quizzes/               # Quiz builder + submissions
    └── reports/               # Analytics dashboard

admin-panel/src/app/
├── core/
│   ├── guards/auth.guard.ts
│   ├── interceptors/          # Auth + Loading interceptors
│   ├── models/index.ts        # All TypeScript interfaces
│   └── services/              # 10 API services
├── shared/
│   ├── layout/                # App shell
│   ├── sidebar/               # Navigation
│   ├── header/                # Top bar + notifications
│   ├── not-found/             # 404 page
│   └── components/
│       ├── toast/             # Global notifications
│       ├── page-header/       # Reusable page header
│       └── confirm-modal/     # Delete confirmation
└── modules/                   # 11 feature modules

mobile-app/src/app/
├── services/                  # 6 API services
├── interceptors/auth.interceptor.ts
├── guards/auth.guard.ts
└── pages/                     # 10 full pages
    ├── login/                 # Auth
    ├── home/                  # Student dashboard
    ├── courses/               # Browse subjects
    ├── course-detail/         # Videos + PDFs + Quizzes
    ├── videos/                # Browse all videos
    ├── video-player/          # Full player + notes
    ├── pdfs/                  # Study materials
    ├── quiz/                  # Interactive quiz
    └── profile/               # Student profile
```
