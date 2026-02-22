#!/bin/bash
# Initial Setup Script for DareScore
# Sets up the development environment from scratch

set -e # Exit on error

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🎯 DareScore Setup Script${NC}"
echo -e "${BLUE}=========================${NC}\n"

# Check Node.js version
echo -e "${YELLOW}🔍 Checking Node.js version...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed${NC}"
    echo -e "${YELLOW}Please install Node.js 20+ from https://nodejs.org/${NC}"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 20 ]; then
    echo -e "${RED}❌ Node.js version 20+ required (you have $(node -v))${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Node.js $(node -v)${NC}"

# Check npm
echo -e "${YELLOW}🔍 Checking npm...${NC}"
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is not installed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ npm $(npm -v)${NC}"

# Install dependencies
echo -e "\n${YELLOW}📦 Installing dependencies...${NC}"
npm install
echo -e "${GREEN}✅ Dependencies installed${NC}"

# Setup environment variables
echo -e "\n${YELLOW}⚙️  Setting up environment variables...${NC}"
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "${GREEN}✅ Created .env file${NC}"
    echo -e "${YELLOW}📝 Please edit .env and add your configuration${NC}"
    
    # Generate NEXTAUTH_SECRET
    NEXTAUTH_SECRET=$(openssl rand -base64 32)
    
    # Update .env with generated secret
    if [[ "$OSTYPE" == "darwin"* ]]; then
        # macOS
        sed -i '' "s/your-secret-key-here-replace-in-production/$NEXTAUTH_SECRET/" .env
    else
        # Linux
        sed -i "s/your-secret-key-here-replace-in-production/$NEXTAUTH_SECRET/" .env
    fi
    
    echo -e "${GREEN}✅ Generated NEXTAUTH_SECRET${NC}"
else
    echo -e "${GREEN}✅ .env file already exists${NC}"
fi

# Check if Docker is available
echo -e "\n${YELLOW}🐳 Checking Docker...${NC}"
if command -v docker &> /dev/null; then
    echo -e "${GREEN}✅ Docker is installed${NC}"
    
    # Check if database is running
    if docker ps | grep -q darescore-db; then
        echo -e "${GREEN}✅ Database is already running${NC}"
    else
        echo -e "${YELLOW}📊 Starting database...${NC}"
        docker-compose -f docker-compose.dev.yml up -d
        echo -e "${GREEN}✅ Database started${NC}"
        
        # Wait for database to be ready
        echo -e "${YELLOW}⏳ Waiting for database to be ready...${NC}"
        sleep 5
    fi
else
    echo -e "${YELLOW}⚠️  Docker not found - you'll need to set up PostgreSQL manually${NC}"
fi

# Generate Prisma Client
echo -e "\n${YELLOW}🔧 Generating Prisma Client...${NC}"
npx prisma generate
echo -e "${GREEN}✅ Prisma Client generated${NC}"

# Run migrations
echo -e "\n${YELLOW}🗄️  Running database migrations...${NC}"
npx prisma migrate deploy
echo -e "${GREEN}✅ Migrations completed${NC}"

# Seed database
echo -e "\n${YELLOW}🌱 Seeding database with demo data...${NC}"
npm run db:seed
echo -e "${GREEN}✅ Database seeded${NC}"

# Install Playwright browsers (for E2E tests)
echo -e "\n${YELLOW}🎭 Installing Playwright browsers...${NC}"
npx playwright install --with-deps chromium
echo -e "${GREEN}✅ Playwright browsers installed${NC}"

# Create backup directory
echo -e "\n${YELLOW}📁 Creating backup directory...${NC}"
mkdir -p backups
echo -e "${GREEN}✅ Backup directory created${NC}"

# Make scripts executable
echo -e "\n${YELLOW}🔐 Making scripts executable...${NC}"
chmod +x scripts/*.sh
echo -e "${GREEN}✅ Scripts are executable${NC}"

# Final summary
echo -e "\n${BLUE}=====================================${NC}"
echo -e "${GREEN}✨ Setup complete!${NC}"
echo -e "${BLUE}=====================================${NC}\n"

echo -e "${BLUE}📚 Next steps:${NC}"
echo -e "  1. Edit ${YELLOW}.env${NC} and configure your environment variables"
echo -e "  2. Run ${YELLOW}npm run dev${NC} to start the development server"
echo -e "  3. Open ${YELLOW}http://localhost:3000${NC} in your browser"
echo -e "  4. Login with demo account: ${YELLOW}demo1@test.com / password123${NC}\n"

echo -e "${BLUE}📖 Useful commands:${NC}"
echo -e "  ${YELLOW}npm run dev${NC}           - Start development server"
echo -e "  ${YELLOW}npm test${NC}              - Run tests in watch mode"
echo -e "  ${YELLOW}npm run test:e2e${NC}      - Run end-to-end tests"
echo -e "  ${YELLOW}npm run db:studio${NC}     - Open Prisma Studio"
echo -e "  ${YELLOW}npm run lint${NC}          - Lint code"
echo -e "  ${YELLOW}docker:dev${NC}            - Start database only\n"

echo -e "${GREEN}Happy coding! 🎉${NC}\n"
