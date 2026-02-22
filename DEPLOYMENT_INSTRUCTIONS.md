# 🚀 Deployment Instructions

This guide walks you through deploying DareScore to production on Vercel.

---

## Prerequisites

- ✅ All P0 items completed (see `PRODUCTION_READINESS_CHECKLIST.md`)
- ✅ Vercel account created ([signup here](https://vercel.com/signup))
- ✅ Vercel CLI installed: `npm install -g vercel`
- ✅ PostgreSQL database (Vercel Postgres, Supabase, or AWS RDS)
- ✅ Sentry account for error tracking ([signup here](https://sentry.io/signup/))

---

## Option 1: One-Command Deployment (Recommended)

### Using the Automated Script

```bash
# Make script executable (Linux/Mac)
chmod +x scripts/deploy.sh

# Run deployment
./scripts/deploy.sh
```

**Windows (PowerShell):**
```powershell
.\scripts\deploy.ps1
```

The script will:
1. ✅ Run type checks
2. ✅ Run linting
3. ✅ Run tests
4. ✅ Build the application
5. ✅ Deploy to Vercel
6. ✅ Run post-deployment health checks

---

## Option 2: Manual Vercel Deployment

### Step 1: Install Vercel CLI

```bash
npm install -g vercel
```

### Step 2: Link Project to Vercel

```bash
vercel link
```

Follow the prompts to:
- Select your Vercel account
- Create a new project or link to existing
- Confirm settings

### Step 3: Configure Environment Variables

Go to your Vercel project dashboard → **Settings** → **Environment Variables**

Add these variables for **Production**:

| Variable | Value | Example |
|----------|-------|---------|
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` | (32+ character string) |
| `NEXTAUTH_URL` | Your production URL | `https://darescore.com` |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry DSN (public) | `https://...@sentry.io/...` |
| `SENTRY_DSN` | Sentry DSN (server) | `https://...@sentry.io/...` |
| `STORAGE_PROVIDER` | `s3` or `local` | `s3` |
| `AWS_S3_BUCKET` | S3 bucket name | `darescore-uploads-prod` |
| `AWS_S3_REGION` | AWS region | `us-east-1` |
| `AWS_ACCESS_KEY_ID` | AWS access key | (AWS key) |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | (AWS secret) |

**Optional but recommended:**
| Variable | Description |
|----------|-------------|
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret |
| `LOG_LEVEL` | `info` or `debug` |

### Step 4: Deploy to Preview

```bash
vercel
```

This deploys to a preview URL. Test it thoroughly!

### Step 5: Deploy to Production

Once preview is tested:

```bash
vercel --prod
```

---

## Option 3: GitHub Integration (Automated CI/CD)

### Setup

1. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/yourusername/darescore.git
   git push -u origin main
   ```

2. **Connect to Vercel:**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click **"Add New Project"**
   - Import your GitHub repository
   - Configure environment variables (same as manual)

3. **Automatic Deployments:**
   - `main` branch → Production
   - `dev` branch → Preview
   - Feature branches → Preview

### GitHub Actions

The project includes CI/CD workflows (`.github/workflows/*.yml`) that run on every push:

- ✅ Linting
- ✅ Type checking
- ✅ Unit tests
- ✅ Integration tests
- ✅ E2E tests (on main/dev)
- ✅ Build verification

---

## Database Setup

### Option A: Vercel Postgres (Easiest)

1. Go to your Vercel project → **Storage** → **Create Database**
2. Select **Postgres**
3. Vercel automatically sets `DATABASE_URL` environment variable
4. Run migrations:
   ```bash
   npx prisma migrate deploy
   ```

### Option B: Supabase (Free Tier Available)

1. Create project at [Supabase](https://supabase.com/)
2. Get connection string from **Project Settings** → **Database**
3. Add to Vercel environment variables as `DATABASE_URL`
4. Run migrations

### Option C: AWS RDS

1. Create PostgreSQL RDS instance
2. Configure security groups (allow Vercel IPs)
3. Get connection string
4. Add to Vercel as `DATABASE_URL`

---

## Post-Deployment Checklist

### Immediately After Deploy

- [ ] Visit deployment URL
- [ ] Check `/api/health` endpoint returns 200
- [ ] Test user registration/login
- [ ] Create a test challenge
- [ ] Upload proof (image/video)
- [ ] Verify points system works
- [ ] Check error tracking in Sentry
- [ ] Test on mobile device

### Within 24 Hours

- [ ] Monitor Sentry for errors
- [ ] Check Vercel Analytics for performance
- [ ] Test all critical user flows
- [ ] Verify email notifications (if configured)
- [ ] Test OAuth logins
- [ ] Check database connections
- [ ] Review application logs
- [ ] Set up uptime monitoring

### Within First Week

- [ ] Collect user feedback
- [ ] Monitor performance metrics
- [ ] Review security logs
- [ ] Test backup/restore procedure
- [ ] Update documentation
- [ ] Plan next iteration

---

## Rollback Procedure

If deployment has critical issues:

### Quick Rollback

```bash
# Revert to previous deployment
vercel rollback
```

### Manual Rollback

1. Go to Vercel Dashboard → **Deployments**
2. Find previous working deployment
3. Click **⋮** → **Promote to Production**

---

## Environment-Specific Configs

### Development
```bash
NEXTAUTH_URL=http://localhost:3000
STORAGE_PROVIDER=local
LOG_LEVEL=debug
```

### Staging/Preview
```bash
NEXTAUTH_URL=https://darescore-preview.vercel.app
STORAGE_PROVIDER=s3
LOG_LEVEL=info
```

### Production
```bash
NEXTAUTH_URL=https://darescore.com
STORAGE_PROVIDER=s3
LOG_LEVEL=info
NODE_ENV=production
```

---

## Monitoring & Alerts

### Set Up Monitoring

1. **Sentry** - Error tracking
   - Already configured! Just add DSN to environment variables
   - Set up alerts for error thresholds

2. **Vercel Analytics** - Performance monitoring
   - Automatically enabled for all Vercel projects
   - View in Vercel Dashboard → **Analytics**

3. **Uptime Monitoring** - Use one of:
   - [UptimeRobot](https://uptimerobot.com/) (free)
   - [Pingdom](https://www.pingdom.com/)
   - [Checkly](https://www.checklyhq.com/)

4. **Database Monitoring**
   - Enable slow query logs
   - Set up connection pool monitoring
   - Alert on high CPU/memory usage

### Recommended Alerts

- Error rate > 1% (5 min window)
- Response time p95 > 1s
- Database connections > 80% of pool
- Uptime check fails (immediate)
- Failed deployments (immediate)

---

## Custom Domain Setup

### Add Custom Domain

1. Go to Vercel Dashboard → **Settings** → **Domains**
2. Add your domain (e.g., `darescore.com`)
3. Update DNS records at your registrar:
   ```
   Type: A
   Name: @
   Value: 76.76.21.21

   Type: CNAME
   Name: www
   Value: cname.vercel-dns.com
   ```
4. Wait for DNS propagation (5-30 minutes)
5. Vercel automatically provisions SSL certificate

### Update Environment Variables

After adding custom domain:
```bash
# Update NEXTAUTH_URL
vercel env add NEXTAUTH_URL production
# Enter: https://darescore.com
```

---

## Troubleshooting

### Build Fails

```bash
# Check build logs
vercel logs

# Common issues:
# 1. Missing environment variables
# 2. TypeScript errors
# 3. Prisma generation fails

# Solution: Run locally first
npm run build
```

### Database Connection Fails

```bash
# Test connection
npx prisma db push

# Check connection string format
# Should be: postgresql://USER:PASSWORD@HOST:PORT/DATABASE

# Verify IP whitelist (for AWS RDS)
# Add Vercel IPs to security group
```

### Sentry Not Receiving Errors

1. Verify `SENTRY_DSN` is set correctly
2. Check Sentry project settings
3. Trigger test error: `/api/error-test`
4. Check browser console for CSP blocks

### Performance Issues

```bash
# Enable Edge Runtime (faster)
# Add to page.tsx:
export const runtime = 'edge'

# Optimize images
# Use next/image component everywhere

# Enable caching
# Add cache headers to API routes
```

---

## Scaling Considerations

### When to Scale

Monitor these metrics:
- Response time p95 > 500ms
- Database connections > 70% of pool
- Error rate > 0.5%
- Concurrent users > 1000

### Scaling Options

1. **Vercel Pro** - More bandwidth, faster builds
2. **Database** - Upgrade to larger instance
3. **CDN** - Add Cloudflare in front
4. **Caching** - Add Redis for session store
5. **Edge Functions** - Convert to edge runtime

---

## Security Checklist

Before going live:

- [ ] HTTPS enforced everywhere
- [ ] Security headers configured
- [ ] Rate limiting active
- [ ] Database backups enabled
- [ ] Sentry error tracking configured
- [ ] Environment secrets secured
- [ ] OAuth redirect URLs whitelisted
- [ ] CSP headers configured
- [ ] CORS properly configured
- [ ] SQL injection prevented (Prisma)

---

## Quick Commands

```bash
# Deploy to preview
vercel

# Deploy to production
vercel --prod

# View logs
vercel logs

# Check deployment status
vercel ls

# Rollback
vercel rollback

# Run migrations on production database
vercel env pull .env.production.local
npx prisma migrate deploy
```

---

## Support

If you encounter issues:

1. Check [Vercel Documentation](https://vercel.com/docs)
2. Check [Next.js Documentation](https://nextjs.org/docs)
3. Check `TROUBLESHOOTING.md` in this repo
4. Open an issue on GitHub

---

## Success! 🎉

Your DareScore app is now live in production!

**Next steps:**
1. Share with beta users
2. Monitor metrics closely
3. Collect feedback
4. Iterate and improve

Good luck! 🚀
