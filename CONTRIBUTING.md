# Contributing to BookMyShow Clone

Thank you for your interest in contributing to the **BookMyShow MERN Clone**! We welcome bug reports, feature enhancements, documentation improvements, and architectural ideas.

Please take a moment to review this document to ensure a smooth and efficient review process.

---

## 🌳 Branching Strategy

Our repository maintains a clean, linear git history with `main` serving as the production-ready branch.

- **`main`**: Production-ready, tagged releases. All pull requests merge into `main`.
- **`feature/<feature-name>`**: Used for new feature implementations (e.g. `feature/stripe-integration`).
- **`fix/<bug-description>`**: Used for bug fixes and patches (e.g. `fix/seat-timer-sync`).
- **`perf/<optimization>`**: Used for performance enhancements (e.g. `perf/lean-queries`).
- **`docs/<topic>`**: Used for documentation enhancements (e.g. `docs/api-specs`).

---

## 📝 Commit Message Conventions

We adhere strictly to [Conventional Commits](https://www.conventionalcommits.org/en/v1.0.0/). Each commit message should follow this structure:

```
<type>(<scope>): <short description>

[optional body]

[optional footer(s)]
```

### Supported Types:
- **`feat`**: A new user-facing feature or API endpoint.
- **`fix`**: A bug fix or runtime patch.
- **`perf`**: Code changes that improve database or client performance.
- **`refactor`**: Code changes that neither fix a bug nor add a feature.
- **`docs`**: Documentation changes only.
- **`test`**: Adding missing tests or correcting existing tests.
- **`chore`**: Maintenance tasks, dependencies, tooling, or release packaging.

### Examples:
- `feat(booking): add dynamic discount promo code engine`
- `fix(socket): prevent race condition during simultaneous seat release`
- `perf(db): optimize showtime queries with compound index`
- `docs(readme): update deployment instructions for railway`

---

## 💻 Local Development Workflow

### 1. Fork & Clone
```bash
git clone https://github.com/<your-username>/BookMyShow-Clone.git
cd BookMyShow-Clone
```

### 2. Setup Environment
```bash
# Backend setup
cd backend
cp .env.example .env
npm install

# Frontend setup
cd ../frontend
cp .env.example .env
npm install
```

### 3. Verify Local Baseline
```bash
# Seed initial data
cd ../backend
npm run seed:admin
npm run seed

# Run linters
npm run lint
cd ../frontend
npm run lint
```

---

## 🧪 Code Style & Standards

- **ESLint & Prettier:** Code must adhere to repository linting configurations. Run `npm run lint` and `npm run format:check` before committing.
- **Plain Objects vs Hydration:** For public read-only endpoints, always use `.lean()` on Mongoose queries unless schema virtuals or `.save()` are explicitly required.
- **Input Sanitization:** Always use `escapeRegex()` when constructing dynamic regular expressions from user queries.
- **Component Design:** React components must be modular, accessible, and styled using Tailwind CSS tokens matching the cyber-dark design palette (`#0b0f19` background, `#f84464` brand crimson).

---

## 📋 Pull Request Checklist

Before submitting your pull request, please verify that you have completed the following:

- [ ] My code adheres to the project's code style and passes all linter checks (`npm run lint`).
- [ ] I have executed existing verification scripts in `backend/scripts/` to prevent regressions.
- [ ] My commits follow the Conventional Commits specification.
- [ ] I have updated any relevant documentation, API schemas, or environment variables.
- [ ] If I added a new database query, I evaluated whether an index is needed and ensured no redundant duplicates were introduced.
- [ ] The application builds cleanly for production (`cd frontend && npm run build`).

Thank you for contributing to modern open-source software engineering!
