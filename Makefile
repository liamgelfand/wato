.PHONY: help setup install dev docker-up docker-down docker-db db-migrate db-seed db-studio test lint build logs mobile-install mobile-setup mobile mobile-stop mobile-web mobile-android

# Wato — common commands (requires `make`: Git Bash, WSL, or `choco install make` on Windows)

help: ## Show available commands
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-14s\033[0m %s\n", $$1, $$2}'

setup: install ## First-time setup: install deps, start DB, migrate, seed
	node -e "const fs=require('fs'); if (!fs.existsSync('.env')) fs.copyFileSync('.env.example', '.env');"
	@echo "Edit .env and set NEXTAUTH_SECRET, then run: make dev"
	$(MAKE) docker-db
	$(MAKE) db-migrate
	$(MAKE) db-seed

install: ## Install npm dependencies
	npm install

dev: docker-db ## Local dev: Postgres in Docker, app on host with hot reload
	npm run dev

docker-up: ## Run full stack in Docker (DB + app)
	docker compose up db -d --wait
	npm run db:migrate:deploy
	docker compose --profile prod up -d --build app
	@echo "Open http://localhost:3000"
	@echo "First time? Seed demo data: make docker-seed"

docker-seed: ## Seed demo users/data (DB must be running)
	npm run db:seed

docker-down: ## Stop full Docker stack
	docker compose --profile prod down

docker-db: ## Start Postgres only (for local dev)
	docker compose up db -d

db-migrate: ## Apply database migrations
	npm run db:migrate

db-seed: ## Seed demo data
	npm run db:seed

db-studio: ## Open Prisma Studio
	npm run db:studio

test: ## Run unit + integration tests (CI mode)
	npm run test:ci

lint: ## Lint and typecheck
	npm run lint
	npx prisma generate
	npx tsc --noEmit

build: ## Production build
	npx prisma generate
	npm run build

logs: ## Tail app container logs (docker-up only)
	docker compose logs -f app

mobile-install: ## Install mobile app dependencies
	cd mobile && npm install
	cd mobile && npx expo install --fix

mobile-setup: mobile-install ## First-time mobile setup (install + .env)
	node -e "const fs=require('fs'); const d='mobile/.env'; if (!fs.existsSync(d)) fs.copyFileSync('mobile/.env.example', d);"
	@echo "Edit mobile/.env — use http://localhost:3000 on laptop, or your LAN IP for a phone"

mobile-stop: ## Stop Metro bundler (frees port 8081)
	node mobile/scripts/free-port.js 8081

mobile: mobile-stop ## Start Expo dev server (press w=web, a=android, scan QR for phone)
	cd mobile && npm start

mobile-web: mobile-stop ## Run mobile app in browser (laptop — set EXPO_PUBLIC_API_URL=http://localhost:3000)
	cd mobile && npm run web

mobile-android: mobile-stop ## Run mobile app in Android emulator
	cd mobile && npm run android
