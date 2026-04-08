# Deployment Guide — CodeForageAI

## Canonical Service Layout

- Backend: `/home/runner/work/CodeForageAI/CodeForageAI/backend`
- Frontend: `/home/runner/work/CodeForageAI/CodeForageAI/frontend`

Use only this backend/frontend pair for production to avoid duplicate-frontend divergence.

---

## Local Development (Docker Compose)

```bash
# 1. Copy env file
cp .env.example .env
# Fill in all values in .env

# 2. Start infrastructure
docker-compose up -d postgres redis minio qdrant

# 3. Start backend
cd backend
./mvnw spring-boot:run

# 4. Start frontend
cd ../frontend
npm install
npm run dev
```

---

## Production Deployment

### Option A: Railway / Render (Easiest)

1. Push to GitHub
2. Connect Railway/Render to your repo
3. Add all env vars from `.env`
4. Deploy backend as Java service
5. Deploy frontend as Next.js service

### Option B: VPS (DigitalOcean / AWS EC2)

```bash
# Install Docker
curl -fsSL https://get.docker.com | sh

# Clone repo
git clone https://github.com/your-repo/CodeForageAI.git
cd CodeForageAI

# Build backend
cd backend
./mvnw package -DskipTests
docker build -t codeforage-backend .

# Build frontend
cd ../frontend
npm ci
npm run build
docker build -t codeforage-frontend .

# Run with docker-compose
docker-compose -f docker-compose.prod.yml up -d
```

### Option C: Vercel + Railway

- Frontend → Vercel (zero-config Next.js)
- Backend → Railway (Java)
- DB, Redis, MinIO → Railway plugins

---

## Required Environment Variables

### Backend (.env)
```
DB_URL=jdbc:postgresql://host:5432/codeforagedb
DB_USER=postgres
DB_PASSWORD=your-secure-password

JWT_SECRET=your-32-char-minimum-secret-key-here
JWT_ACCESS_TOKEN_TTL_MS=3600000

MINIO_ENDPOINT=http://minio:9000
MINIO_ACCESS_KEY=your-minio-key
MINIO_SECRET_KEY=your-minio-secret
MINIO_BUCKET=codeforageai

REDIS_HOST=redis
REDIS_PORT=6379

OPENAI_API_KEY=sk-your-real-key

RAZORPAY_KEY_ID=rzp_live_xxx
RAZORPAY_KEY_SECRET=your-secret
PAYMENT_PRO_AMOUNT_PAISE=99900

CORS_ALLOWED_ORIGINS=https://your-frontend-domain.com

GOOGLE_CLIENT_ID=xxx.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=xxx
GITHUB_CLIENT_ID=xxx
GITHUB_CLIENT_SECRET=xxx
```

### Frontend (.env.local)
```
NEXT_PUBLIC_API_URL=https://your-backend-domain.com/api
```

---

## Kubernetes Preview (Optional)

Preview feature requires Kubernetes. For production:

```yaml
# In application.yaml
kubernetes:
  enabled: true
  ingress-domain: preview.yourdomain.com
  preview-image: node:20-alpine
```

For local dev, preview is disabled (`KUBERNETES_ENABLED=false`) — this is expected.

---

## SSL / HTTPS

Use Nginx reverse proxy:

```nginx
server {
    listen 443 ssl;
    server_name app.yourdomain.com;

    location /api {
        proxy_pass http://localhost:8080;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location / {
        proxy_pass http://localhost:3000;
    }
}
```

Use Certbot for free SSL:
```bash
certbot --nginx -d app.yourdomain.com
```
