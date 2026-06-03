# Mitra Magang ITS – Admin Dashboard

> Internal admin dashboard for managing **Mitra Magang ITS** partner data, built with Next.js, React, and Supabase.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Prerequisites](#prerequisites)
- [Getting Started](#getting-started)
- [Available Scripts](#available-scripts)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)
- [License](#license)

---

## Tech Stack

| Layer      | Technology              |
| ---------- | ----------------------- |
| Framework  | Next.js 16 (App Router) |
| Language   | TypeScript 5            |
| UI         | React 19                |
| Styling    | Tailwind CSS            |
| Backend    | Supabase (Auth & DB)    |
| Linting    | ESLint 9                |
| Formatting | Prettier                |

---

## Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9 (ships with Node 18+)
- A [Supabase](https://supabase.com) project with the `admins` table configured

---

## Getting Started

1. **Clone the repository**

   ```bash
   git clone https://github.com/<org>/pso-c-6.git
   cd pso-c-6
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   Copy the example env file and fill in your Supabase credentials:

   ```bash
   cp .env.example .env.local
   ```

   See [Environment Variables](#environment-variables) for details.

4. **Run the development server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Available Scripts

| Command                | Description                                       |
| ---------------------- | ------------------------------------------------- |
| `npm run dev`          | Start the Next.js development server              |
| `npm run build`        | Create an optimized production build              |
| `npm start`            | Serve the production build                        |
| `npm run lint`         | Run ESLint across the project                     |
| `npm run lint:fix`     | Run ESLint and auto-fix issues                    |
| `npm run format`       | Format all files with Prettier                    |
| `npm run format:check` | Check formatting without writing changes          |
| `npm run typecheck`    | Run the TypeScript compiler in check-only mode    |
| `npm run validate`     | Run lint, format check, and typecheck in sequence |

---

## Project Structure

```
pso-c-6/
├── .github/
│   └── workflows/       # CI/CD pipeline definitions
├── public/              # Static assets
├── src/
│   ├── app/             # Next.js App Router pages & layouts
│   │   ├── api/         # API route handlers
│   │   ├── dashboard/   # Dashboard page
│   │   ├── layout.tsx   # Root layout
│   │   └── page.tsx     # Login / landing page
│   ├── components/      # Reusable React components
│   └── lib/             # Shared utilities & Supabase client
├── eslint.config.mjs    # ESLint flat config
├── .prettierrc          # Prettier configuration
├── tsconfig.json        # TypeScript configuration
├── next.config.ts       # Next.js configuration
└── package.json
```

---

## Environment Variables

Create a `.env.local` file in the project root with the following keys:

| Variable                        | Description                        | Required |
| ------------------------------- | ---------------------------------- | -------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | Your Supabase project URL          | ✅       |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous/public key      | ✅       |
| `SUPABASE_SERVICE_ROLE_KEY`     | Supabase service-role key (server) | Optional |

> **Note:** Never commit `.env.local` to version control. The `.gitignore` already excludes `.env*` files.

---

## Contributing

### Branch Naming

Use the following format:

```
<type>/<short-description>
```

Examples: `feature/add-export`, `fix/login-redirect`, `chore/update-deps`

### Conventional Commits

This project follows the [Conventional Commits](https://www.conventionalcommits.org/) specification. Every commit message must follow this format:

```
<type>(optional scope): <description>
```

| Type       | When to use                                             |
| ---------- | ------------------------------------------------------- |
| `feat`     | A new feature                                           |
| `fix`      | A bug fix                                               |
| `docs`     | Documentation only changes                              |
| `style`    | Formatting, missing semicolons, etc.                    |
| `refactor` | Code change that neither fixes a bug nor adds a feature |
| `test`     | Adding or updating tests                                |
| `chore`    | Build process, CI, tooling, or dependency changes       |

**Examples:**

```
feat(dashboard): add partner export button
fix(auth): handle expired session redirect
docs: update README setup instructions
chore: configure eslint and prettier
```

### Workflow

1. Create a branch from `main`:

   ```bash
   git checkout -b feature/your-feature-name
   ```

2. Make your changes and ensure quality checks pass:

   ```bash
   npm run validate
   ```

3. Commit using the conventional commit format.
4. Push your branch and open a Pull Request.

---

## License

This project is developed for internal use by the ITS Mitra Magang team. All rights reserved.
