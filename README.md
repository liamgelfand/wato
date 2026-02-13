# DareScore - Social Challenge App

A TikTok-style social challenge app where users complete challenges for points, compete with friends, and climb the leaderboard. Built with safety-first principles and community-driven verification.

## 🚀 Features

### Core Functionality
- **Challenge Feed**: Discover challenges created by the community
- **Create Challenges**: Design your own challenges for others to attempt
- **Proof Submission**: Upload photo/video proof of challenge completion
- **Community Verification**: Friends verify each other's attempts
- **Points & Leaderboard**: Earn points and compete with friends
- **Friends System**: Connect with friends to verify attempts
- **Messaging**: Chat 1:1 with your friends
- **Notifications**: Stay updated on verifications, messages, and friend requests

### Safety & Moderation
- **Content Validation**: Automatic filtering of prohibited content
- **Reporting System**: Easy-to-use reporting for inappropriate content
- **Admin Dashboard**: Comprehensive moderation tools
- **Rate Limiting**: Protection against spam and abuse
- **Safety Guidelines**: Clear rules and community standards

## 🛠 Tech Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: TailwindCSS + shadcn/ui
- **Database**: PostgreSQL via Prisma ORM
- **Authentication**: NextAuth v5 (Credentials + Google OAuth)
- **Storage**: S3-compatible (local filesystem for development)
- **Validation**: Zod
- **Date Handling**: date-fns

## 📋 Prerequisites

- Node.js 18+ 
- PostgreSQL 14+
- npm or yarn

## ⚡ Quick Start

### 1. Clone and Install

```bash
cd social_media_app
npm install
```

### 2. Environment Setup

Copy the example environment file:

```bash
cp .env.example .env
```

Update `.env` with your configuration:

```env
# Database
DATABASE_URL="postgresql://user:password@localhost:5432/darescore"

# NextAuth
NEXTAUTH_SECRET="your-secret-key-here"  # Generate with: openssl rand -base64 32
NEXTAUTH_URL="http://localhost:3000"

# OAuth (optional)
GOOGLE_CLIENT_ID=""
GOOGLE_CLIENT_SECRET=""

# Storage
STORAGE_PROVIDER="local"  # or "s3"

# S3 Storage (only if STORAGE_PROVIDER=s3)
AWS_S3_BUCKET=""
AWS_S3_REGION=""
AWS_ACCESS_KEY_ID=""
AWS_SECRET_ACCESS_KEY=""
S3_ENDPOINT=""  # optional, for S3-compatible services
```

### 3. Database Setup

```bash
# Run migrations
npm run db:migrate

# Seed with demo data
npm run db:seed
```

### 4. Start Development Server

```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

## 👥 Demo Accounts

After seeding, you can log in with these test accounts:

| Email | Role | Password |
|-------|------|----------|
| demo1@test.com | ADMIN | password123 |
| demo2@test.com | USER | password123 |
| demo3@test.com | USER | password123 |
| demo4@test.com | USER | password123 |
| demo5@test.com | USER | password123 |

## 📁 Project Structure

```
darescore/
├── app/                      # Next.js app router pages
│   ├── (auth)/              # Auth pages (login, register)
│   ├── admin/               # Admin dashboard
│   ├── api/                 # API routes
│   ├── attempt/[id]/        # Attempt pages
│   ├── challenge/[id]/      # Challenge detail
│   ├── create/              # Create challenge
│   ├── friends/             # Friends management
│   ├── leaderboard/         # Leaderboard
│   ├── messages/            # Messaging
│   ├── notifications/       # Notifications
│   ├── profile/             # User profile
│   ├── safety/              # Safety guidelines
│   └── page.tsx             # Home feed
├── components/              # React components
│   ├── attempt/             # Proof uploader
│   ├── challenge/           # Challenge cards
│   ├── friends/             # Friend components
│   ├── layout/              # Navbar, mobile nav
│   ├── moderation/          # Report dialog
│   ├── notifications/       # Notification UI
│   ├── providers/           # Context providers
│   └── ui/                  # shadcn/ui components
├── lib/                     # Utilities and helpers
│   ├── auth.ts              # NextAuth config
│   ├── db.ts                # Prisma client
│   ├── moderation.ts        # Content validation
│   ├── notifications.ts     # Notification helpers
│   ├── points.ts            # Points system
│   ├── storage.ts           # File storage
│   ├── utils.ts             # General utilities
│   └── validations.ts       # Zod schemas
├── prisma/                  # Database
│   ├── schema.prisma        # Database schema
│   └── seed.ts              # Seed script
├── public/                  # Static files
│   └── uploads/             # Local file uploads
└── middleware.ts            # Rate limiting & auth
```

## 🎯 Key Features Explained

### Challenge Creation
- All challenges validated for safety
- Automatic content moderation
- Points calculated based on difficulty (1-5)
- Categories: Fitness, Skill, Creativity, Adventure, Funny

### Verification System
- Community-driven verification
- Requires 2+ friend verifications to approve
- 1+ rejection auto-rejects attempt
- Admin can override decisions

### Points & Leaderboard
- Base points: 10 × difficulty level
- Atomic point awarding (no double-awards)
- All-time and weekly leaderboards
- Only visible among friends

### Safety Features
- Banned words/categories filtering
- Content reporting system
- Admin moderation dashboard
- Rate limiting on actions
- Clear safety guidelines

## 🔒 Safety & Content Policy

DareScore prohibits:
- ❌ Alcohol, drugs, substances
- ❌ Self-harm or dangerous activities
- ❌ Violence or fighting
- ❌ Weapons
- ❌ Illegal activities
- ❌ Harassment or bullying
- ❌ Sexual content
- ❌ Dangerous stunts

See [Safety Guidelines](/safety) for full details.

## 🚀 Production Deployment

### Database
1. Set up PostgreSQL database
2. Update `DATABASE_URL` in production
3. Run migrations: `npx prisma migrate deploy`

### File Storage
1. Set `STORAGE_PROVIDER=s3`
2. Configure AWS S3 or S3-compatible service
3. Add credentials to environment variables

### Environment Variables
Ensure all required environment variables are set in your hosting platform.

### Security
- Use strong `NEXTAUTH_SECRET`
- Enable HTTPS
- Configure CORS if needed
- Review rate limiting settings

## 🛠 Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:migrate` - Run database migrations
- `npm run db:seed` - Seed database with demo data
- `npm run db:studio` - Open Prisma Studio
- `npm run db:push` - Push schema changes (development)

## 📝 TODO: Future Enhancements

### Planned Features
- [ ] AI-powered proof verification
- [ ] WebSocket for real-time updates
- [ ] Badge/achievement system
- [ ] Challenge templates
- [ ] Advanced analytics
- [ ] Multi-language support
- [ ] PWA support
- [ ] Video thumbnails generation

### AI Proof Verification
Add a webhook after proof upload in `/api/attempts/upload-proof/route.ts`:

```typescript
// TODO: AI proof verification hook
// await verifyProofWithAI(proofUrl, attempt.challengeId)
```

Integrate with an ML service to automatically verify proof validity.

## 🤝 Contributing

This is an MVP project. Suggestions for improvements:
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is for educational/demonstration purposes.

## 🙏 Acknowledgments

- Built with Next.js, Prisma, and shadcn/ui
- Icons from Lucide React
- Inspired by social challenge apps with a safety-first approach

---

**DareScore** - Challenge yourself, compete with friends, stay safe! 🏆
