# DareScore - Social Challenge App 🏆

A TikTok-style social challenge app where users complete challenges for points, compete with friends, and climb the leaderboard. Built with safety-first principles, comprehensive testing, and industry-standard DevOps practices.

## 🚀 Features

### Core Functionality
- **Challenge Feed**: Discover challenges created by the community
- **Create Challenges**: Design your own challenges for others to attempt
- **Proof Submission**: Upload photo/video proof of challenge completion
- **Community Verification**: Friends verify each other's attempts
- **Points & Leaderboard**: Earn points and compete with friends (total & weekly)
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

### Application
- **Framework**: Next.js 16 (App Router)
- **Language**: TypeScript 5
- **Styling**: TailwindCSS 4 + shadcn/ui
- **Database**: PostgreSQL 14 via Prisma ORM 7
- **Authentication**: NextAuth v5 (Credentials + Google OAuth)
- **Storage**: S3-compatible (local filesystem for development)
- **Validation**: Zod

### Testing
- **Unit Tests**: Jest + React Testing Library
- **Integration Tests**: Jest + Supertest
- **E2E Tests**: Playwright
- **BDD Tests**: Cucumber.js
- **Coverage**: 70%+ target

### DevOps
- **Containerization**: Docker + Docker Compose
- **CI/CD**: GitHub Actions
- **Branching**: Git Flow
- **Code Quality**: ESLint + TypeScript
- **Security**: npm audit + Snyk

## 📋 Prerequisites

- **Node.js** 20+
- **Docker** & Docker Compose (recommended)
- **Git** for version control
- **PostgreSQL** 14+ (or use Docker)

## ⚡ Quick Start

### Option 1: Docker (Recommended)

The fastest way to get started:

```bash
# Start database
docker-compose -f docker-compose.dev.yml up -d

# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Edit .env with your configuration

# Run migrations and seed
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000)

### Option 2: Full Docker Stack

Run the entire application in containers:

```bash
# Copy environment file
cp .env.example .env
# Update .env with production-like settings

# Build and start all services
docker-compose up --build

# Access at http://localhost:3000
```

### Option 3: Local Development (No Docker)

If you have PostgreSQL installed locally:

```bash
# Install dependencies
npm install

# Setup environment
cp .env.example .env
# Update DATABASE_URL to your local PostgreSQL

# Run migrations and seed
npm run db:migrate
npm run db:seed

# Start development server
npm run dev
```

## 🧪 Testing

### Run All Tests

```bash
# Run all test suites
npm run test:all
```

### Individual Test Suites

```bash
# Unit tests (watch mode)
npm test

# Unit tests (CI mode with coverage)
npm run test:ci

# Integration tests
npm run test:integration

# E2E tests with Playwright
npm run test:e2e

# E2E tests with UI
npm run test:e2e:ui

# BDD tests with Cucumber
npm run test:bdd
```

### Test Structure

```
__tests__/
  ├── unit/                 # Unit tests
  │   ├── lib/             # Library/utility tests
  │   └── components/      # Component tests
  └── integration/         # Integration tests
      ├── api/            # API route tests
      └── db/             # Database tests
e2e/                       # End-to-end tests
  ├── auth.spec.ts
  ├── challenges.spec.ts
  └── leaderboard.spec.ts
features/                  # BDD feature files
  ├── challenge-creation.feature
  ├── challenge-attempt.feature
  └── step_definitions/
```

### Test Coverage

View coverage report after running tests:

```bash
npm run test:ci
# Coverage report in: coverage/lcov-report/index.html
```

## 🐳 Docker Commands

### Development

```bash
# Start dev database only
npm run docker:dev

# Stop dev database
npm run docker:dev:down

# View database logs
docker logs darescore-db-dev -f
```

### Production

```bash
# Build images
npm run docker:build

# Start all services
npm run docker:up

# View logs
npm run docker:logs

# Stop all services
npm run docker:down
```

### Testing

```bash
# Run tests in Docker
npm run docker:test
```

## 🌳 Git Workflow

This project follows **Git Flow** branching strategy. See [BRANCHING_STRATEGY.md](./BRANCHING_STRATEGY.md) for detailed guidelines.

### Quick Reference

```bash
# Create feature branch
git checkout dev
git pull origin dev
git checkout -b feature/your-feature-name

# Work on feature
git add .
git commit -m "feat: add your feature"

# Push and create PR
git push origin feature/your-feature-name
# Create PR: feature/your-feature-name → dev
```

### Branch Structure
- `main` - Production-ready code
- `dev` - Development integration branch
- `feature/*` - New features
- `bugfix/*` - Bug fixes
- `hotfix/*` - Critical production fixes
- `release/*` - Release preparation

## 🔄 CI/CD Pipeline

GitHub Actions automatically runs on every push and pull request:

### Workflows

1. **Main CI/CD** (`.github/workflows/ci.yml`)
   - Linting & type checking
   - Unit & integration tests
   - E2E tests
   - BDD tests
   - Build verification
   - Security audit

2. **Frontend CI** (`.github/workflows/frontend.yml`)
   - Triggered on frontend file changes
   - Frontend-specific tests
   - Build checks

3. **Backend CI** (`.github/workflows/backend.yml`)
   - Triggered on backend file changes
   - Backend-specific tests
   - Database migration checks
   - API security scan

4. **Docker** (`.github/workflows/docker.yml`)
   - Build Docker images
   - Push to container registry
   - Docker Compose testing

### CI/CD Status Badges

Add these to your GitHub repository:

```markdown
![CI/CD](https://github.com/username/darescore/workflows/CI/CD%20Pipeline/badge.svg)
![Tests](https://github.com/username/darescore/workflows/Tests/badge.svg)
```

## 📚 Project Structure

```
.
├── app/                      # Next.js app directory
│   ├── api/                 # API routes
│   ├── (pages)/             # Page components
│   └── layout.tsx           # Root layout
├── components/              # React components
│   ├── ui/                 # shadcn/ui components
│   └── ...                 # Feature components
├── lib/                     # Utility libraries
│   ├── auth.ts             # NextAuth configuration
│   ├── db.ts               # Prisma client
│   ├── validations.ts      # Zod schemas
│   ├── points.ts           # Points calculation
│   └── ...
├── prisma/                  # Database schema & migrations
│   ├── schema.prisma       # Data model
│   ├── migrations/         # Migration files
│   └── seed.ts             # Seed script
├── __tests__/               # Unit & integration tests
├── e2e/                     # End-to-end tests
├── features/                # BDD test features
├── public/                  # Static assets
├── .github/                 # GitHub Actions workflows
│   └── workflows/
├── docker-compose.yml       # Production Docker setup
├── docker-compose.dev.yml   # Development Docker setup
├── docker-compose.test.yml  # Testing Docker setup
├── Dockerfile               # Production container
├── Dockerfile.test          # Test container
└── ...config files
```

## 🔒 Environment Variables

Required environment variables:

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | PostgreSQL connection string | Yes |
| `NEXTAUTH_SECRET` | NextAuth JWT secret | Yes |
| `NEXTAUTH_URL` | Application URL | Yes |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | Optional |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | Optional |
| `STORAGE_PROVIDER` | Storage type (`local` or `s3`) | Yes |
| `AWS_S3_BUCKET` | S3 bucket name | If using S3 |
| `AWS_S3_REGION` | S3 region | If using S3 |
| `AWS_ACCESS_KEY_ID` | AWS access key | If using S3 |
| `AWS_SECRET_ACCESS_KEY` | AWS secret key | If using S3 |

Generate secrets:

```bash
# NEXTAUTH_SECRET
openssl rand -base64 32
```

## 🔧 Development Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm start` | Start production server |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests in watch mode |
| `npm run test:ci` | Run tests with coverage |
| `npm run test:unit` | Run unit tests only |
| `npm run test:integration` | Run integration tests |
| `npm run test:e2e` | Run E2E tests |
| `npm run test:bdd` | Run BDD tests |
| `npm run db:push` | Push schema to database |
| `npm run db:migrate` | Run migrations |
| `npm run db:seed` | Seed database |
| `npm run db:studio` | Open Prisma Studio |

## 📖 Documentation

- [Setup Guide](./SETUP.md) - Detailed setup instructions
- [Branching Strategy](./BRANCHING_STRATEGY.md) - Git workflow guidelines
- [API Documentation](./docs/API.md) - API endpoints (coming soon)
- [Architecture](./docs/ARCHITECTURE.md) - System design (coming soon)

## 🧑‍💻 Development Guidelines

### Code Style
- Follow TypeScript best practices
- Use ESLint and Prettier
- Write self-documenting code
- Add JSDoc comments for complex functions

### Testing
- Write tests for new features
- Maintain 70%+ code coverage
- Test edge cases and error handling
- Use descriptive test names

### Commits
Follow [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add new feature
fix: resolve bug
docs: update documentation
test: add tests
refactor: improve code structure
style: format code
chore: update dependencies
```

### Pull Requests
- Fill out the PR template completely
- Link related issues
- Ensure all CI checks pass
- Request reviews from team members
- Keep PRs focused and reasonably sized

## 🚀 Deployment

### Production Deployment

1. **Build Docker Image**
   ```bash
   docker build -t darescore:latest .
   ```

2. **Deploy with Docker Compose**
   ```bash
   docker-compose up -d
   ```

3. **Environment Variables**
   - Set production environment variables
   - Use strong secrets
   - Configure S3 storage
   - Set up monitoring

### Deployment Platforms

Compatible with:
- **Vercel** (recommended for Next.js)
- **AWS ECS/Fargate**
- **Google Cloud Run**
- **DigitalOcean App Platform**
- **Kubernetes**
- **Any Docker-compatible platform**

## 🐛 Troubleshooting

### Database Connection Issues

```bash
# Check if database is running
docker ps | grep darescore-db

# View database logs
docker logs darescore-db

# Restart database
docker restart darescore-db
```

### Migration Issues

```bash
# Reset database (⚠️ destroys data)
npx prisma migrate reset

# Push schema without migration
npx prisma db push
```

### Build Errors

```bash
# Clear Next.js cache
rm -rf .next

# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Generate Prisma Client
npx prisma generate
```

## 📄 License

This project is licensed under the MIT License.

## 👥 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'feat: add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

See [BRANCHING_STRATEGY.md](./BRANCHING_STRATEGY.md) for detailed workflow.

## 🙏 Acknowledgments

- Built with [Next.js](https://nextjs.org/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Icons from [Lucide](https://lucide.dev/)

## 📧 Contact

For questions or support, please open an issue on GitHub.

---

**Happy Challenging! 🎯**
