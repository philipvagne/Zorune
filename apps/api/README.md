# OpsFlow API

NestJS + Prisma backend for OpsFlow.

This package contains:

- authentication and JWT session handling
- organization, project, task, and note APIs
- realtime notifications and presence over Socket.IO
- Prisma schema and migrations

## Quick start

1. Copy `apps/api/.env.example` to `apps/api/.env`
2. Start PostgreSQL from the repository root with `docker compose up -d`
3. Install dependencies in `apps/api`
4. Run `npx prisma migrate dev`
5. Run `npm run start:dev`

For the full project setup, environment variables, and frontend instructions, use the root [README](C:/Users/phili/Desktop/opsflow/README.md).
