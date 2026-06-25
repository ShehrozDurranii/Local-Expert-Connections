# ExpertConnect

Full-stack Next.js + Express.js + MySQL application.

## Structure

- frontend: Next.js App Router
- backend: Express REST API
- database: SQL schema and seed files
- docs: OpenAPI specification

## Setup

1. Clone repository
2. Import database SQL files into MySQL if setting up a fresh environment.
3. Configure backend .env
4. Install dependencies.

Root (sets up Husky pre-commit hooks):

```bash
npm install
```

Backend:

```bash
cd backend
npm install
npm run dev
```

Frontend:

```bash
cd frontend
npm install
npm run dev
```

Frontend connects to backend using NEXT_PUBLIC_API_URL.

## Local Development Quality Checks

This project uses **Husky** + **lint-staged** + **Prettier** + **ESLint** to automatically enforce code quality on every commit.

### How It Works

```
Developer writes code
        ↓
   git commit
        ↓
Husky pre-commit hook runs
        ↓
lint-staged checks ONLY staged files
        ↓
  Prettier formatting
        ↓
   ESLint validation
        ↓
Pass → commit allowed
Fail → commit blocked
```

### What Gets Checked

| File Pattern                    | Checks                                       |
| ------------------------------- | -------------------------------------------- |
| `frontend/**/*.{js,jsx,ts,tsx}` | Prettier formatting + ESLint (Next.js rules) |
| `backend/**/*.{js,jsx}`         | Prettier formatting + ESLint (Node.js rules) |
| `*.{json,md,yml,yaml,css}`      | Prettier formatting                          |

### Manual Commands

Run these from the **repository root**:

```bash
# Format all files with Prettier
npm run format

# Check formatting without modifying files
npm run format:check

# Run ESLint on both frontend and backend
npm run lint

# Run ESLint on frontend only
npm run lint:frontend

# Run ESLint on backend only
npm run lint:backend
```

### Troubleshooting

- **Hooks not running?** Run `npm install` from the root to re-initialize Husky.
- **Want to skip hooks temporarily?** Use `git commit --no-verify` (not recommended).
- **ESLint errors on commit?** Fix the reported issues or run `npm run lint` to see all errors.

> **Note:** Husky is for local development only. The GitHub Actions CI/CD pipeline handles remote verification after push.
