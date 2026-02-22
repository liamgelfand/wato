# Git Branching Strategy

This project follows a **Git Flow** branching model for organized development and releases.

## Branch Structure

### Main Branches

#### `main`
- **Purpose**: Production-ready code
- **Protection**: Protected, requires PR approval
- **Deploys to**: Production environment
- **Naming**: `main`

#### `dev`
- **Purpose**: Integration branch for features
- **Protection**: Protected, requires PR approval
- **Deploys to**: Staging/development environment
- **Naming**: `dev`

### Supporting Branches

#### Feature Branches
- **Purpose**: New features and enhancements
- **Branch from**: `dev`
- **Merge back to**: `dev`
- **Naming convention**: `feature/<ticket-id>-<short-description>`
- **Examples**:
  - `feature/DS-123-add-video-uploads`
  - `feature/DS-456-improve-leaderboard-ui`
  - `feature/notification-system`

#### Bugfix Branches
- **Purpose**: Bug fixes for upcoming releases
- **Branch from**: `dev`
- **Merge back to**: `dev`
- **Naming convention**: `bugfix/<ticket-id>-<short-description>`
- **Examples**:
  - `bugfix/DS-789-fix-points-calculation`
  - `bugfix/auth-redirect-loop`

#### Hotfix Branches
- **Purpose**: Critical production bug fixes
- **Branch from**: `main`
- **Merge back to**: `main` AND `dev`
- **Naming convention**: `hotfix/<version>-<short-description>`
- **Examples**:
  - `hotfix/1.0.1-fix-security-issue`
  - `hotfix/critical-database-leak`

#### Release Branches
- **Purpose**: Prepare for production release
- **Branch from**: `dev`
- **Merge back to**: `main` AND `dev`
- **Naming convention**: `release/<version>`
- **Examples**:
  - `release/1.0.0`
  - `release/2.1.0`

## Workflow

### 1. Starting New Work

```bash
# Update your local dev branch
git checkout dev
git pull origin dev

# Create a feature branch
git checkout -b feature/DS-123-new-feature

# Work on your feature
git add .
git commit -m "feat: add new feature"

# Push to remote
git push origin feature/DS-123-new-feature
```

### 2. Creating a Pull Request

1. Push your feature branch to remote
2. Open a PR from your branch → `dev`
3. Fill in the PR template:
   - Description of changes
   - Related ticket/issue
   - Testing performed
   - Screenshots (if UI changes)
4. Request review from team members
5. Ensure CI/CD passes:
   - ✅ All tests pass
   - ✅ Linting passes
   - ✅ Build succeeds
   - ✅ Code coverage maintained

### 3. Code Review Process

**Reviewers should check:**
- Code quality and best practices
- Test coverage
- Performance implications
- Security considerations
- Documentation updates

**Required approvals:** 1 (adjust based on team size)

### 4. Merging

```bash
# After PR approval, merge using GitHub UI (recommended)
# Or locally:
git checkout dev
git merge --no-ff feature/DS-123-new-feature
git push origin dev

# Delete the feature branch
git branch -d feature/DS-123-new-feature
git push origin --delete feature/DS-123-new-feature
```

### 5. Release Process

```bash
# Create release branch from dev
git checkout dev
git pull origin dev
git checkout -b release/1.1.0

# Update version numbers, changelog, etc.
npm version minor  # or major, patch

# Commit version bump
git commit -am "chore: bump version to 1.1.0"

# Push release branch
git push origin release/1.1.0

# Create PR to main (for production)
# After testing and approval, merge to main
git checkout main
git merge --no-ff release/1.1.0
git tag -a v1.1.0 -m "Version 1.1.0"
git push origin main --tags

# Merge back to dev
git checkout dev
git merge --no-ff release/1.1.0
git push origin dev

# Delete release branch
git branch -d release/1.1.0
git push origin --delete release/1.1.0
```

### 6. Hotfix Process

```bash
# Create hotfix from main
git checkout main
git pull origin main
git checkout -b hotfix/1.0.1-critical-fix

# Fix the issue
git commit -am "fix: critical security issue"

# Merge to main
git checkout main
git merge --no-ff hotfix/1.0.1-critical-fix
git tag -a v1.0.1 -m "Hotfix 1.0.1"
git push origin main --tags

# Merge to dev
git checkout dev
git merge --no-ff hotfix/1.0.1-critical-fix
git push origin dev

# Delete hotfix branch
git branch -d hotfix/1.0.1-critical-fix
git push origin --delete hotfix/1.0.1-critical-fix
```

## Commit Message Convention

We follow **Conventional Commits** specification:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, etc.)
- `refactor`: Code refactoring
- `perf`: Performance improvements
- `test`: Adding or updating tests
- `chore`: Maintenance tasks
- `ci`: CI/CD changes

### Examples
```bash
feat(challenges): add video upload support
fix(auth): resolve redirect loop on logout
docs(readme): update installation instructions
test(api): add integration tests for challenges endpoint
chore(deps): update dependencies to latest versions
```

## Branch Protection Rules

### `main` branch
- ✅ Require pull request reviews (1 approval)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ✅ Require linear history
- ✅ Include administrators
- ❌ Allow force pushes
- ❌ Allow deletions

### `dev` branch
- ✅ Require pull request reviews (1 approval)
- ✅ Require status checks to pass
- ✅ Require branches to be up to date
- ❌ Allow force pushes
- ❌ Allow deletions

## Quick Reference

| Action | Command |
|--------|---------|
| Create feature | `git checkout -b feature/name dev` |
| Create bugfix | `git checkout -b bugfix/name dev` |
| Create hotfix | `git checkout -b hotfix/name main` |
| Create release | `git checkout -b release/x.y.z dev` |
| Update from dev | `git checkout dev && git pull && git checkout - && git merge dev` |
| Rebase on dev | `git checkout feature/name && git rebase dev` |

## Resources

- [Git Flow Cheatsheet](https://danielkummer.github.io/git-flow-cheatsheet/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Flow](https://guides.github.com/introduction/flow/)
