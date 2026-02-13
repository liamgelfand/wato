# DareScore Setup Guide

## Quick Setup Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Setup PostgreSQL Database

**Option A: Local PostgreSQL**
```bash
# Install PostgreSQL (if not already installed)
# macOS: brew install postgresql
# Windows: Download from postgresql.org
# Linux: sudo apt-get install postgresql

# Create database
createdb darescore
```

**Option B: Docker PostgreSQL**
```bash
docker run --name darescore-db -e POSTGRES_PASSWORD=password -e POSTGRES_DB=darescore -p 5432:5432 -d postgres:14
```

### 3. Configure Environment Variables

Copy `.env.example` to `.env`:
```bash
cp .env.example .env
```

Update the `.env` file with your configuration:
```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/darescore"
NEXTAUTH_SECRET="your-generated-secret-here"
NEXTAUTH_URL="http://localhost:3000"
STORAGE_PROVIDER="local"
```

Generate a secure NEXTAUTH_SECRET:
```bash
# macOS/Linux
openssl rand -base64 32

# Windows (PowerShell)
[Convert]::ToBase64String((1..32 | ForEach-Object { Get-Random -Minimum 0 -Maximum 256 }))
```

### 4. Initialize Database

```bash
# Run migrations
npm run db:migrate

# Seed with demo data
npm run db:seed
```

### 5. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## Test Accounts

| Email | Role | Password |
|-------|------|----------|
| demo1@test.com | ADMIN | password123 |
| demo2@test.com | USER | password123 |
| demo3@test.com | USER | password123 |
| demo4@test.com | USER | password123 |
| demo5@test.com | USER | password123 |

## Common Issues

### Database Connection Error
- Verify PostgreSQL is running
- Check DATABASE_URL in .env
- Ensure database exists

### Prisma Migration Error
```bash
# Reset database (WARNING: deletes all data)
npx prisma migrate reset

# Or push schema without migrations
npm run db:push
```

### Module Not Found Errors
```bash
# Clear Next.js cache
rm -rf .next

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install
```

### Port Already in Use
```bash
# Use different port
PORT=3001 npm run dev
```

## Production Deployment

### Vercel (Recommended)
1. Push code to GitHub
2. Import project in Vercel
3. Add environment variables
4. Deploy

### Environment Variables for Production
- `DATABASE_URL` - PostgreSQL connection string
- `NEXTAUTH_SECRET` - Strong random secret
- `NEXTAUTH_URL` - Your production URL
- `STORAGE_PROVIDER` - "s3" for production
- AWS S3 credentials (if using S3)

### Database Migration
```bash
npx prisma migrate deploy
```

## Development Tips

### Prisma Studio
View and edit database data:
```bash
npm run db:studio
```

### Reset Database
```bash
npx prisma migrate reset
npm run db:seed
```

### Check Linting
```bash
npm run lint
```

### Build for Production
```bash
npm run build
npm start
```

## Feature Testing Checklist

- [ ] Register new account
- [ ] Login with demo account
- [ ] Create a challenge
- [ ] View challenge feed
- [ ] Filter challenges by category
- [ ] Attempt a challenge
- [ ] Upload proof (image/video)
- [ ] Send friend request
- [ ] Accept friend request
- [ ] Verify friend's attempt
- [ ] Check leaderboard
- [ ] Send message to friend
- [ ] Receive notification
- [ ] Report inappropriate content
- [ ] Admin: View reports
- [ ] Admin: Moderate content

## Support

For issues or questions, check:
- README.md for full documentation
- Prisma docs: https://www.prisma.io/docs
- Next.js docs: https://nextjs.org/docs
- NextAuth docs: https://next-auth.js.org

---

Happy challenging! 🏆
