# DRS Education Backend — NestJS + MongoDB + Mongoose

## Stack
- **Framework**: NestJS 10
- **Database**: MongoDB (via Mongoose 8)
- **Auth**: JWT (15min access + 7d refresh tokens, auto-expiry via TTL index)
- **Docs**: Swagger / OpenAPI at `/api/docs`

## Quick Start

### 1. Install dependencies
```bash
npm install
```

### 2. Configure environment
```bash
cp .env.example .env
```
Edit `.env`:
```env
# Local MongoDB
MONGODB_URI="mongodb://localhost:27017/drs_education"

# OR MongoDB Atlas (cloud)
MONGODB_URI="mongodb+srv://username:password@cluster.xxxxx.mongodb.net/drs_education"

JWT_SECRET="your-secret-key"
JWT_REFRESH_SECRET="your-refresh-secret"
```

### 3. Seed the database
```bash
npm run seed
```

### 4. Start development server
```bash
npm run start:dev
```

- API:   http://localhost:3000/api/v1
- Docs:  http://localhost:3000/api/docs

---

## API Endpoints

| Module         | Endpoints |
|----------------|-----------|
| **Auth**       | POST /auth/login, POST /auth/refresh, GET /auth/me, POST /auth/logout |
| **Classes**    | CRUD + GET /:id/students + PATCH /:id/status |
| **Subjects**   | CRUD |
| **Videos**     | CRUD + PATCH /:id/publish + PATCH /:id/featured + POST /:id/watch |
| **PDFs**       | CRUD + PATCH /:id/publish |
| **Students**   | CRUD + GET /:id/progress |
| **Teachers**   | CRUD |
| **Quizzes**    | CRUD + PATCH /:id/publish + POST /:id/attempt |
| **Announcements** | CRUD + PATCH /:id/publish |

## Default Credentials (after seeding)
| Role    | Email                             | Password     |
|---------|-----------------------------------|--------------|
| Admin   | admin@drseducation.in             | Admin@123    |
| Teacher | rajesh.patel@drseducation.in      | Teacher@123  |
| Student | priya.sharma@student.in           | Student@123  |
