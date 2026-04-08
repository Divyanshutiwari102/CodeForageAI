# CodeForageAI

Production structure:

- `backend` → Spring Boot backend
- `frontend` → Next.js frontend (single source of truth)
- `docker-compose.yml` → infra stack (Postgres/Redis/MinIO/Qdrant/observability)

## Local startup

```bash
# 1) Backend
cd backend
./mvnw spring-boot:run

# 2) Frontend (new shell)
cd frontend
npm install
npm run dev
```

## Java requirement

Backend requires Java 21. Verify:

```bash
java -version
```

---
