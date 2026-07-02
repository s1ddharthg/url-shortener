# ⚡ High-Performance URL Shortener

A production-ready, ultra-fast URL Shortener built with a modern split-service architecture. Features sub-millisecond redirect lookups using Redis caching and asynchronous tracking logic offloaded to a Redis-backed message queue (BullMQ).


---


### 🌐 Live Production

👉 **Deployment URL**: [https://url-shortener-phi-plum.vercel.app/](https://url-shortener-phi-plum.vercel.app/)


---


### 🛠️ Tech Stack

| Category | Badges |
| :--- | :--- |
| **Frontend** | [![Next.js](https://img.shields.io/badge/Next.js-16.2.9-black?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org/) [![React](https://img.shields.io/badge/React-19.2.4-61dafb?style=for-the-badge&logo=react&logoColor=black)](https://react.dev/) [![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4.0-38bdf8?style=for-the-badge&logo=tailwindcss&logoColor=white)](https://tailwindcss.com/) |
| **Backend** | [![Hono](https://img.shields.io/badge/Hono-v4.12-E36034?style=for-the-badge&logo=hono&logoColor=white)](https://hono.dev/) [![Node.js Server](https://img.shields.io/badge/Node.js-Server-43853d?style=for-the-badge&logo=node.js&logoColor=white)](https://github.com/honojs/node-server) [![TypeScript](https://img.shields.io/badge/TypeScript-v5.8-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/) |
| **Database & Cache** | [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/) [![Redis](https://img.shields.io/badge/Redis-7-DC382D?style=for-the-badge&logo=redis&logoColor=white)](https://redis.io/) [![Drizzle ORM](https://img.shields.io/badge/Drizzle_ORM-v0.45-C5F72A?style=for-the-badge&logo=drizzle&logoColor=black)](https://orm.drizzle.team/) |
| **Async Queues** | [![BullMQ](https://img.shields.io/badge/BullMQ-v5.79-CC292B?style=for-the-badge&logo=bull&logoColor=white)](https://bullmq.io/) |
| **Deployment** | [![Vercel](https://img.shields.io/badge/Vercel-Deployed-black?style=for-the-badge&logo=vercel&logoColor=white)](https://vercel.com/) |


---


## ⚙️ Core Configuration (Environment Variables)

### Backend Services (`backend/.env`)

Create a `backend/.env` file with the following variables:

```env
PORT=3010
DB_PASSWORD=your_postgres_password
DATABASE_URL=postgresql://postgres:your_postgres_password@127.0.0.1:5432/url-shortener
REDIS_URL=redis://127.0.0.1:6379
NEXT_PUBLIC_API_URL=http://localhost:3010
```

### Frontend Services (`frontend/.env.local`)

Create a `frontend/.env.local` file with the following variables:

```env
NEXT_PUBLIC_API_URL=http://localhost:3010
```


---


## 🚀 Local Development Setup

Follow these steps to run the complete stack locally.

### 1. Prerequisites

- [Docker & Docker Compose](https://www.docker.com/) installed.
- [Node.js v20+](https://nodejs.org/) and `npm` installed.

### 2. Start PostgreSQL and Redis

Spin up the local containerized instances of Postgres and Redis using the root configuration:

```bash
docker compose up -d
```

*Configured services in docker-compose:*
- **PostgreSQL**: Port `5432`
- **Redis**: Port `6379`

### 3. Setup and Migrate Database

Navigate to the backend directory and run Drizzle migrations to sync the schema with PostgreSQL:

```bash
cd backend
npx drizzle-kit push
```

### 4. Start the Backend API Server

With Postgres & Redis running, run the Hono development server (which also boots up the BullMQ consumer worker):

```bash
npm run dev
```

*The Hono API server will boot up on port `3010`.*

### 5. Start the Next.js Frontend

In a separate terminal tab/session, open the frontend directory and start the Next.js dev server:

```bash
cd frontend
npm install
npm run dev
```

*The frontend development server will start on port `3011`.*


---


## 📊 Database Schema

Designed using Drizzle ORM, optimized with unique constraints for fast lookup indices.

### `shortener` Table

Stores mappings between base62-encoded keys and their long destinations.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `serial` | Primary Key | Auto-incremented sequence ID. |
| `link` | `varchar(255)` | Not Null | Original long destination URL. |
| `code` | `varchar(255)` | Not Null, Unique | Generated Base-62 short key. |

### `clicks` Table

Stores raw click analytics collected asynchronously from the Redis worker queue.

| Column | Type | Constraints | Description |
| :--- | :--- | :--- | :--- |
| `id` | `serial` | Primary Key | Auto-incremented click ID. |
| `short_code` | `varchar(255)` | Not Null | The matching short key. |
| `ip` | `varchar(255)` | - | Redacted/Raw IP address of visitor. |
| `user_agent` | `text` | - | Client Browser User Agent string. |
| `clicked_at` | `timestamp` | Default Now, Not Null | Date and time of click transaction. |


---


## 🔌 API Endpoints Reference

### 1. Create Shortened URL

- **URL**: `/api/shortener`
- **Method**: `POST`
- **Rate Limit**: Max 10 requests per minute per IP.
- **Payload**:

```json
{
  "link": "https://google.com"
}
```

- **Response (200 OK)**:

```json
{
  "code": "b"
}
```

### 2. URL Redirection

- **URL**: `/:code`
- **Method**: `GET`
- **Behavior**: Looks up `:code` in Redis. On miss, queries PostgreSQL. Registers a click job to BullMQ queue, then returns an immediate HTTP `302 Found` redirect.
- **Response**: `HTTP/1.1 302 Found` with `Location` header redirecting to original link.

### 3. Analytics Endpoint

- **URL**: `/stats/:code`
- **Method**: `GET`
- **Response (200 OK)**:

```json
{
  "totalClicks": 142,
  "uniqueVisitors": 54,
  "dailyClicks": [
    { "date": "2026-07-01", "clicks": 45 },
    { "date": "2026-07-02", "clicks": 97 }
  ]
}
```


---


## ⚡ Production Deployment Configuration

The application is optimized for simple, unified multi-project deployments on Vercel:
* Uses a `vercel.json` router in the root directory.
* Rewrites all `/api/*` and redirection `/shortcode` requests to the **Backend Server**.
* Routes all general assets and front-facing routes to the **Next.js Frontend Service**.

```json
{
    "services": {
        "frontend": { "root": "frontend", "framework": "nextjs" },
        "backend": { "root": "backend" }
    },
    "rewrites": [
        { "source": "/api(/.*)?", "destination": { "type": "service", "service": "backend" } },
        { "source": "/(.*)", "destination": { "type": "service", "service": "frontend" } }
    ]
}
```


---


*Created and maintained with ❤️ for high-scale, ultra-low latency redirection services.*
