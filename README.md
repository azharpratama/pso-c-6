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

## Deployment & CI/CD

This project uses GitHub Actions for an automated CI/CD pipeline deploying to **Azure App Services (Linux)**. The pipeline builds Next.js in **standalone mode** (highly optimized) and deploys to two environments:

1. **Staging App** (`pso-c-6-staging`) - Deploys automatically on any push/merge to `main`.
2. **Production App** (`pso-c-6`) - Deploys after staging is successful and a manual approval gate is cleared.

### 🔑 Required GitHub Secrets (4 total)

| Secret Name                                 | Description / Value                                    |
| :------------------------------------------ | :----------------------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`                  | Your Supabase project URL (used during build step)     |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY`             | Supabase anonymous public key (used during build step) |
| `AZUREAPPSERVICE_PUBLISHPROFILE_STAGING`    | Clean XML publish profile for the Staging web app      |
| `AZUREAPPSERVICE_PUBLISHPROFILE_PRODUCTION` | Clean XML publish profile for the Production web app   |

---

### 📦 Setup Option 1: Automatic CLI Setup (Recommended)

If you have the `az` and `gh` CLIs authenticated on your machine, you can run these commands to set up the infrastructure and secrets in under 2 minutes:

#### 1. Define Variables

```bash
RG="pso-c-6"
LOC="eastus"
PLAN="pso-c-6-plan"
STAGING_APP="pso-c-6-staging"
PROD_APP="pso-c-6"
```

#### 2. Create Azure Resources & Enable SCM Basic Auth

```bash
# Create Resource Group & App Service Plan
az group create --name $RG --location $LOC
az appservice plan create --name $PLAN -g $RG --sku B1 --is-linux

# Create Web Apps
az webapp create --name $STAGING_APP -g $RG --plan $PLAN --runtime "NODE:20-lts"
az webapp create --name $PROD_APP -g $RG --plan $PLAN --runtime "NODE:20-lts"

# Enable SCM Basic Auth (Required for Publish Profiles) & Restart Apps
az resource update -g $RG --name scm --namespace Microsoft.Web --resource-type basicPublishingCredentialsPolicies --parent sites/$STAGING_APP --set properties.allow=true
az resource update -g $RG --name scm --namespace Microsoft.Web --resource-type basicPublishingCredentialsPolicies --parent sites/$PROD_APP --set properties.allow=true
az webapp restart -g $RG -n $STAGING_APP
az webapp restart -g $RG -n $PROD_APP
```

#### 3. Configure App Settings for Next.js Standalone

```bash
# Configure Staging
az webapp config appsettings set -g $RG -n $STAGING_APP --settings SCM_DO_BUILD_DURING_DEPLOYMENT=false HOSTNAME=0.0.0.0 WEBSITE_RUN_FROM_PACKAGE=1
az webapp config set -g $RG -n $STAGING_APP --generic-configurations '{"appCommandLine": "node server.js"}'

# Configure Production
az webapp config appsettings set -g $RG -n $PROD_APP --settings SCM_DO_BUILD_DURING_DEPLOYMENT=false HOSTNAME=0.0.0.0 WEBSITE_RUN_FROM_PACKAGE=1
az webapp config set -g $RG -n $PROD_APP --generic-configurations '{"appCommandLine": "node server.js"}'
```

#### 4. Extract Publish Profiles & Set GitHub Secrets

```bash
# Download and strip FTP profiles to keep only Web Deploy profile (avoids XML parsing issues in GitHub Actions)
az webapp deployment list-publishing-profiles -g $RG -n $STAGING_APP --xml | node -e "
  const content = fs.readFileSync(0, 'utf-8');
  const match = content.match(/<publishProfile[^>]*publishMethod=\\\"MSDeploy\\\"[^>]*>.*?<\/publishProfile>/);
  if (match) console.log('<publishData>\n  ' + match[0] + '\n</publishData>');
" | gh secret set AZUREAPPSERVICE_PUBLISHPROFILE_STAGING

az webapp deployment list-publishing-profiles -g $RG -n $PROD_APP --xml | node -e "
  const content = fs.readFileSync(0, 'utf-8');
  const match = content.match(/<publishProfile[^>]*publishMethod=\\\"MSDeploy\\\"[^>]*>.*?<\/publishProfile>/);
  if (match) console.log('<publishData>\n  ' + match[0] + '\n</publishData>');
" | gh secret set AZUREAPPSERVICE_PUBLISHPROFILE_PRODUCTION
```

---

### 🖥️ Setup Option 2: Manual GUI Setup

If you prefer to configure this using the Azure Portal and GitHub Web UI:

#### 1. Create the App Services in Azure Portal

- Go to [Azure Portal](https://portal.azure.com).
- Click **Create a resource** and search/select **Web App**.
- Configure the basics:
  - **Subscription & Resource Group**: Select your subscription and resource group.
  - **Name**: Enter `pso-c-6-staging` (for staging) and `pso-c-6` (for production).
  - **Publish**: Choose `Code`.
  - **Runtime stack**: Choose `Node 20 LTS`.
  - **Operating System**: Choose `Linux`.
  - **Region**: Select your region (e.g., `East US` or `Indonesia Central`).
  - **Pricing Plan**: Choose `Basic B1` (Linux) or higher (needed for custom startup command and settings propagation).
- Review and click **Create**.

#### 2. Configure Web App Settings

For both Web Apps, navigate to their respective App Service pages and configure:

1. **Enable Basic Auth & Startup Command**:
   - Go to **Settings > Configuration** (or **Environment variables** in newer portal layouts) on the left sidebar.
   - Go to the **General settings** tab.
   - Set **Basic Auth Publishing Credentials** (or **SCM Basic Auth**) to **On**.
   - Set **Startup Command** to `node server.js`.
2. **Add Environment Settings**:
   - Go to the **Application settings** tab.
   - Click **+ New application setting** to add the following 3 settings:
     - Name: `SCM_DO_BUILD_DURING_DEPLOYMENT`, Value: `false` (bypasses slow container builds)
     - Name: `HOSTNAME`, Value: `0.0.0.0` (binds the app correctly to all network interfaces)
     - Name: `WEBSITE_RUN_FROM_PACKAGE`, Value: `1` (mounts zip deployment package directly)
   - Click **Save** (at the bottom or top of the page) and **Restart** the app.

#### 3. Download & Clean the Publish Profiles

- Go to the **Overview** page for each App Service and click **Get publish profile** from the top menu bar to download the `.PublishSettings` XML file.
- Open the downloaded file in a text editor (e.g. VS Code, Notepad).
- The file will contain multiple `<publishProfile>` elements (e.g., MSDeploy, FTP, Zip Deploy). We must remove all profiles except the **MSDeploy** one.
- **Example clean format to keep**:
  ```xml
  <publishData>
    <publishProfile profileName="pso-c-6-staging - Web Deploy" publishMethod="MSDeploy" publishUrl="pso-c-6-staging.scm.azurewebsites.net:443" msdeploySite="pso-c-6-staging" userName="$pso-c-6-staging" userPWD="[YOUR_PASSWORD]" destinationAppUrl="https://pso-c-6-staging.azurewebsites.net" ... />
  </publishData>
  ```
- Make sure to remove any nodes containing `publishMethod="FTP"` or `publishMethod="ZipDeploy"`.

#### 4. Save to GitHub Secrets

- Navigate to your GitHub Repository > **Settings > Secrets and variables > Actions**.
- Click **New repository secret** and add:
  - **Name**: `AZUREAPPSERVICE_PUBLISHPROFILE_STAGING`
    - **Value**: _(Paste the cleaned XML content for the Staging app)_
  - **Name**: `AZUREAPPSERVICE_PUBLISHPROFILE_PRODUCTION`
    - **Value**: _(Paste the cleaned XML content for the Production app)_

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
