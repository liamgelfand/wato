#!/bin/bash
# Deployment Script for DareScore
# Deploys to Vercel with proper checks and safeguards

set -e # Exit on error

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 DareScore Deployment Script${NC}"
echo -e "${BLUE}================================${NC}\n"

# Check if Vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI is not installed${NC}"
    echo -e "${YELLOW}Install it with: npm install -g vercel${NC}"
    exit 1
fi

# Check if we're in a git repository
if [ ! -d .git ]; then
    echo -e "${RED}❌ Not a git repository${NC}"
    exit 1
fi

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}⚠️  Warning: You have uncommitted changes${NC}"
    read -p "Continue anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Get current branch
CURRENT_BRANCH=$(git branch --show-current)
echo -e "${BLUE}📍 Current branch: $CURRENT_BRANCH${NC}\n"

# Determine environment
if [ "$CURRENT_BRANCH" = "main" ]; then
    ENVIRONMENT="production"
    echo -e "${RED}🚨 You are deploying to PRODUCTION${NC}"
elif [ "$CURRENT_BRANCH" = "dev" ]; then
    ENVIRONMENT="preview"
    echo -e "${YELLOW}🔧 You are deploying to STAGING/PREVIEW${NC}"
else
    ENVIRONMENT="preview"
    echo -e "${YELLOW}🔧 You are deploying to PREVIEW (feature branch)${NC}"
fi

# Confirm deployment
echo ""
read -p "Are you sure you want to deploy to $ENVIRONMENT? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo -e "${YELLOW}Deployment cancelled.${NC}"
    exit 0
fi

# Run pre-deployment checks
echo -e "\n${BLUE}🔍 Running pre-deployment checks...${NC}"

# 1. Type check
echo -e "${YELLOW}📝 Type checking...${NC}"
npx tsc --noEmit
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Type check failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Type check passed${NC}"

# 2. Linting
echo -e "${YELLOW}🔍 Linting...${NC}"
npm run lint
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Lint check failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Lint check passed${NC}"

# 3. Unit tests
echo -e "${YELLOW}🧪 Running tests...${NC}"
npm run test:ci
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Tests failed${NC}"
    read -p "Deploy anyway? (y/N): " -n 1 -r
    echo
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi
echo -e "${GREEN}✅ Tests passed${NC}"

# 4. Build check
echo -e "${YELLOW}🏗️  Building application...${NC}"
npm run build
if [ $? -ne 0 ]; then
    echo -e "${RED}❌ Build failed${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build successful${NC}"

# Deploy to Vercel
echo -e "\n${BLUE}🚀 Deploying to Vercel...${NC}"

if [ "$ENVIRONMENT" = "production" ]; then
    # Production deployment
    vercel --prod
else
    # Preview deployment
    vercel
fi

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}✨ Deployment successful!${NC}"
    
    # Get deployment URL
    DEPLOYMENT_URL=$(vercel ls --meta gitBranch=$CURRENT_BRANCH 2>/dev/null | grep https | head -n 1 | awk '{print $2}')
    
    if [ -n "$DEPLOYMENT_URL" ]; then
        echo -e "${GREEN}🌐 Deployment URL: $DEPLOYMENT_URL${NC}"
    fi
    
    # Post-deployment checks
    echo -e "\n${BLUE}🔍 Post-deployment checks...${NC}"
    
    if [ -n "$DEPLOYMENT_URL" ]; then
        # Check health endpoint
        echo -e "${YELLOW}❤️  Checking health endpoint...${NC}"
        sleep 5 # Wait for deployment to be ready
        
        HEALTH_STATUS=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL/api/health")
        
        if [ "$HEALTH_STATUS" = "200" ]; then
            echo -e "${GREEN}✅ Health check passed${NC}"
        else
            echo -e "${RED}⚠️  Health check returned: $HEALTH_STATUS${NC}"
        fi
    fi
    
    echo -e "\n${GREEN}🎉 Deployment complete!${NC}"
    
else
    echo -e "\n${RED}❌ Deployment failed${NC}"
    exit 1
fi
