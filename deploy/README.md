# Deployment Guide

This directory contains deployment configurations for various platforms.

## Quick Links

- [Vercel (Recommended)](#vercel)
- [Docker / Docker Compose](#docker)
- [Kubernetes](#kubernetes)
- [AWS ECS](#aws-ecs)
- [Google Cloud Run](#google-cloud-run)

---

## Vercel

**Best for**: Quick deployment, automatic CI/CD, serverless

### Prerequisites
- Vercel account
- PostgreSQL database (Neon, Supabase, or similar)

### Steps

1. **Install Vercel CLI**
   ```bash
   npm i -g vercel
   ```

2. **Link Project**
   ```bash
   vercel link
   ```

3. **Add Environment Variables**
   ```bash
   vercel env add DATABASE_URL
   vercel env add NEXTAUTH_SECRET
   vercel env add NEXTAUTH_URL
   ```

4. **Deploy**
   ```bash
   vercel --prod
   ```

### Post-Deployment
- Run migrations: Set up a GitHub Action or run manually
- Configure custom domain in Vercel dashboard

---

## Docker

**Best for**: Self-hosting, full control

### Prerequisites
- Docker & Docker Compose installed
- PostgreSQL database or use included docker-compose

### Steps

1. **Build Image**
   ```bash
   docker build -t darescore:latest .
   ```

2. **Run with Docker Compose**
   ```bash
   cp .env.example .env
   # Edit .env with your values
   docker-compose up -d
   ```

3. **Run Migrations**
   ```bash
   docker-compose exec app npm run db:migrate
   ```

4. **Check Health**
   ```bash
   curl http://localhost:3000/api/health
   ```

### Production Notes
- Use a reverse proxy (Nginx, Caddy, Traefik)
- Set up SSL certificates (Let's Encrypt)
- Configure backup strategy for database

---

## Kubernetes

**Best for**: High availability, auto-scaling, enterprise

### Prerequisites
- Kubernetes cluster (GKE, EKS, AKS)
- kubectl configured
- Docker image in registry

### Steps

1. **Push Docker Image**
   ```bash
   docker build -t your-registry/darescore:latest .
   docker push your-registry/darescore:latest
   ```

2. **Update kubernetes.yml**
   - Replace image URL
   - Update secrets

3. **Create Secrets**
   ```bash
   kubectl create secret generic darescore-secrets \
     --from-literal=DATABASE_URL="postgresql://..." \
     --from-literal=NEXTAUTH_SECRET="..." \
     --from-literal=NEXTAUTH_URL="https://yourdomain.com"
   ```

4. **Deploy**
   ```bash
   kubectl apply -f deploy/kubernetes.yml
   ```

5. **Check Status**
   ```bash
   kubectl get pods
   kubectl logs -f deployment/darescore
   ```

### Scaling
```bash
kubectl scale deployment darescore --replicas=5
```

---

## AWS ECS

**Best for**: AWS ecosystem, Fargate serverless containers

### Prerequisites
- AWS account with ECS access
- ECR repository for Docker images
- AWS CLI configured

### Steps

1. **Push to ECR**
   ```bash
   aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin YOUR_ECR_REPO
   docker build -t darescore:latest .
   docker tag darescore:latest YOUR_ECR_REPO/darescore:latest
   docker push YOUR_ECR_REPO/darescore:latest
   ```

2. **Create ECS Task Definition**
   - Use AWS Console or CLI
   - Configure environment variables
   - Set memory/CPU limits

3. **Create ECS Service**
   - Link to Application Load Balancer
   - Configure auto-scaling
   - Set health check: `/api/health`

4. **Run Migrations**
   - Use ECS Exec or run as one-time task
   ```bash
   aws ecs execute-command --cluster your-cluster \
     --task task-id \
     --command "npm run db:migrate" \
     --interactive
   ```

---

## Google Cloud Run

**Best for**: Serverless, automatic scaling, pay-per-use

### Prerequisites
- Google Cloud account
- gcloud CLI installed

### Steps

1. **Build and Push**
   ```bash
   gcloud builds submit --tag gcr.io/YOUR_PROJECT/darescore
   ```

2. **Deploy**
   ```bash
   gcloud run deploy darescore \
     --image gcr.io/YOUR_PROJECT/darescore \
     --platform managed \
     --region us-central1 \
     --allow-unauthenticated \
     --set-env-vars "NODE_ENV=production" \
     --set-secrets="DATABASE_URL=database-url:latest,NEXTAUTH_SECRET=nextauth-secret:latest"
   ```

3. **Run Migrations**
   ```bash
   gcloud run jobs create migration-job \
     --image gcr.io/YOUR_PROJECT/darescore \
     --command npm,run,db:migrate \
     --set-secrets="DATABASE_URL=database-url:latest"
   
   gcloud run jobs execute migration-job
   ```

---

## Environment Variables

All platforms require these environment variables:

| Variable | Required | Description |
|----------|----------|-------------|
| `DATABASE_URL` | Yes | PostgreSQL connection string |
| `NEXTAUTH_SECRET` | Yes | NextAuth secret (32+ chars) |
| `NEXTAUTH_URL` | Yes | Public URL of your app |
| `GOOGLE_CLIENT_ID` | No | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | No | Google OAuth secret |
| `STORAGE_PROVIDER` | Yes | `local` or `s3` |
| `AWS_S3_BUCKET` | No* | S3 bucket name |
| `AWS_S3_REGION` | No* | S3 region |
| `AWS_ACCESS_KEY_ID` | No* | AWS access key |
| `AWS_SECRET_ACCESS_KEY` | No* | AWS secret key |
| `SENTRY_DSN` | No | Sentry error tracking DSN |

\* Required if `STORAGE_PROVIDER=s3`

---

## Post-Deployment Checklist

- [ ] Run database migrations
- [ ] Seed initial data (if needed)
- [ ] Configure DNS and SSL
- [ ] Set up monitoring (Sentry, DataDog, etc.)
- [ ] Configure backups for database
- [ ] Test health check endpoint
- [ ] Set up alerts for downtime
- [ ] Configure CDN (Cloudflare, CloudFront)
- [ ] Review security headers
- [ ] Load test the application

---

## Monitoring

### Health Check Endpoint
```bash
curl https://yourdomain.com/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "timestamp": "2024-01-01T12:00:00.000Z",
  "uptime": 3600,
  "version": "1.0.0",
  "environment": "production",
  "checks": {
    "database": {
      "status": "up",
      "latency": 15
    }
  }
}
```

### Monitoring Services
- **Sentry**: Error tracking
- **DataDog**: Application performance monitoring
- **Grafana**: Custom dashboards
- **PagerDuty**: Incident management

---

## Troubleshooting

### Database Connection Issues
- Check DATABASE_URL is correct
- Verify database is accessible from deployment
- Check connection pool settings
- Review firewall/security group rules

### High Memory Usage
- Reduce connection pool size
- Check for memory leaks
- Increase container memory limits
- Review long-running queries

### Slow Response Times
- Enable database query logging
- Check database indexes
- Review API endpoint performance
- Consider caching strategy

---

## Support

For deployment issues:
1. Check the logs
2. Review environment variables
3. Test health check endpoint
4. Consult platform-specific documentation
5. Open an issue on GitHub
