# 👥 Collaborator Setup Guide

Welcome! This guide will help you set up the NUST Aggregate Calculator project locally.

## 🎯 Quick Setup (No Database Required)

**Good news:** This app works perfectly WITHOUT a database! All data comes from JSON files.

```bash
# 1. Clone the repository
git clone https://github.com/Maazhussain786/Aggregate_calculator_NUST.git
cd Aggregate_calculator_NUST

# 2. Install dependencies
npm install

# 3. Create environment file (optional)
cp .env.example .env.local

# 4. Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) - **It works!** ✅

---

## 🗄️ Database Options

The app has **3 modes** - choose what works for you:

### Option 1: No Database (Recommended for Development) ✅

**Best for:** Contributing code, testing features, quick setup

**Setup:** None! Just run `npm run dev`

**How it works:** 
- API routes automatically fall back to `src/data/sampleMeritData.json`
- All features work normally
- No database required

---

### Option 2: SQLite (Local Database)

**Best for:** Testing database features locally

**Setup:**

```bash
# 1. Edit .env.local and add:
DATABASE_URL="file:./dev.db"

# 2. Set up database
npm run db:generate
npm run db:push
npm run db:seed

# 3. Run dev server
npm run dev
```

**Troubleshooting SQLite:**
- ✅ Works on Windows, Mac, Linux
- ✅ No server needed - just a file
- ✅ Automatically created on first run
- ⚠️ SQLite file (`dev.db`) should NOT be committed to git (already in .gitignore)

---

### Option 3: PostgreSQL (Production-like Setup)

**Best for:** Testing production environment, advanced features

**Common sources:** Supabase, Railway, Neon, Vercel Postgres

**⚠️ SSL Connection Issue - Common Problem!**

If you see this error:
```
Error: SSL connection required
```

**Solution:** Update your `DATABASE_URL` in `.env.local`:

#### For Supabase / Neon / Railway:
```bash
# Wrong (causes SSL error):
DATABASE_URL="postgresql://user:password@host:5432/dbname"

# Correct (add ?sslmode=require):
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"
```

#### For Vercel Postgres:
```bash
# Use the Postgres URL with SSL parameters already included
# Copy the full connection string from Vercel dashboard
POSTGRES_URL="postgres://user:pass@host/db?sslmode=require"
DATABASE_URL="${POSTGRES_URL}"
```

#### For Azure PostgreSQL:
```bash
# Azure requires SSL by default
# Get connection string from Azure Portal → Your Database → Connection Strings

# Format 1 (Recommended):
DATABASE_URL="postgresql://username@servername:password@servername.postgres.database.azure.com:5432/dbname?sslmode=require"

# Format 2 (If format 1 doesn't work):
DATABASE_URL="postgresql://username%40servername:password@servername.postgres.database.azure.com:5432/dbname?ssl=true"

# Note: Azure usernames include @servername suffix
# Example: If username is "myuser" and server is "myserver", use:
# username@myserver or username%40myserver (URL encoded)
```

#### Full PostgreSQL Setup:

**Step 1:** Get a free PostgreSQL database:
- [Supabase](https://supabase.com) - Free tier
- [Neon](https://neon.tech) - Free tier
- [Railway](https://railway.app) - Free trial
- [Vercel Postgres](https://vercel.com/storage/postgres) - Free tier
- [Azure PostgreSQL](https://azure.microsoft.com/en-us/products/postgresql) - Free tier available

**Step 2:** Update `.env.local`:
```bash
# Copy connection string from your provider
# Make sure it includes SSL parameters!
DATABASE_URL="postgresql://user:password@host:5432/dbname?sslmode=require"

# Alternative SSL modes if the above doesn't work:
# ?sslmode=require&sslcert=
# ?sslmode=verify-full
# ?ssl=true
```

**Step 3:** Update Prisma schema (if needed):
```prisma
// prisma/schema.prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

**Step 4:** Set up database:
```bash
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

---

## � Azure PostgreSQL Setup (Step-by-Step)

If your team is using **Azure PostgreSQL**, follow these specific instructions:

### 1️⃣ Create Azure PostgreSQL Database

**Option A: Azure Portal (Web Interface)**
1. Go to [Azure Portal](https://portal.azure.com)
2. Click **"Create a resource"** → Search **"Azure Database for PostgreSQL"**
3. Choose **"Flexible Server"** (recommended) or **"Single Server"**
4. Fill in:
   - **Server name**: `your-nust-db` (example)
   - **Admin username**: `nustadmin` (example)
   - **Password**: Create a strong password
   - **Location**: Choose nearest region
   - **Pricing tier**: Basic (cheapest) or Free tier if available
5. Click **"Review + Create"** → **"Create"**
6. Wait 5-10 minutes for deployment

**Option B: Azure CLI**
```bash
# Login to Azure
az login

# Create resource group
az group create --name nust-calculator-rg --location eastus

# Create PostgreSQL server
az postgres flexible-server create \
  --resource-group nust-calculator-rg \
  --name your-nust-db \
  --admin-user nustadmin \
  --admin-password 'YourStrongPassword123!' \
  --sku-name Standard_B1ms \
  --tier Burstable \
  --version 15
```

### 2️⃣ Configure Firewall Rules

Azure blocks all connections by default. You need to allow access:

**In Azure Portal:**
1. Go to your PostgreSQL server
2. Click **"Networking"** (left sidebar)
3. Under **"Firewall rules"**, add:
   - **Rule name**: `AllowMyIP`
   - **Start IP**: Your IP address (Azure can detect it automatically)
   - **End IP**: Same as start IP
4. For development, you can temporarily check **"Allow public access from any Azure service"**
5. Click **"Save"**

**Using Azure CLI:**
```bash
# Allow your current IP
az postgres flexible-server firewall-rule create \
  --resource-group nust-calculator-rg \
  --name your-nust-db \
  --rule-name AllowMyIP \
  --start-ip-address YOUR_IP \
  --end-ip-address YOUR_IP

# Or allow all IPs (NOT recommended for production)
az postgres flexible-server firewall-rule create \
  --resource-group nust-calculator-rg \
  --name your-nust-db \
  --rule-name AllowAll \
  --start-ip-address 0.0.0.0 \
  --end-ip-address 255.255.255.255
```

### 3️⃣ Get Connection String

**In Azure Portal:**
1. Go to your PostgreSQL server
2. Click **"Connect"** (left sidebar) or **"Connection strings"**
3. Copy the connection string
4. It will look like:
```
Server=your-nust-db.postgres.database.azure.com;Database=postgres;Port=5432;User Id=nustadmin;Password={your_password};Ssl Mode=Require;
```

### 4️⃣ Convert to Prisma Format

Azure gives you a .NET-style connection string. Convert it to PostgreSQL URL format:

**Azure format:**
```
Server=your-nust-db.postgres.database.azure.com;Database=postgres;Port=5432;User Id=nustadmin;Password=YourPass123;Ssl Mode=Require;
```

**Convert to Prisma format:**
```bash
# Format: postgresql://username@servername:password@host:port/database?sslmode=require

# Your .env.local should have:
DATABASE_URL="postgresql://nustadmin@your-nust-db:YourPass123@your-nust-db.postgres.database.azure.com:5432/postgres?sslmode=require"

# Or with URL-encoded @ symbol:
DATABASE_URL="postgresql://nustadmin%40your-nust-db:YourPass123@your-nust-db.postgres.database.azure.com:5432/postgres?sslmode=require"
```

**Important Notes:**
- Azure username format: `username@servername`
- Use `%40` instead of `@` in the username part (URL encoding)
- Always include `?sslmode=require` at the end
- Default database is usually `postgres`

### 5️⃣ Update Project Files

**Update `prisma/schema.prisma`:**
```prisma
datasource db {
  provider = "postgresql"  // Change from "sqlite"
  url      = env("DATABASE_URL")
}
```

**Create `.env.local`:**
```bash
# Copy your Azure connection string here
DATABASE_URL="postgresql://nustadmin%40your-nust-db:YourPass123@your-nust-db.postgres.database.azure.com:5432/postgres?sslmode=require"
```

### 6️⃣ Initialize Database

```bash
# Generate Prisma Client
npm run db:generate

# Create tables in Azure database
npm run db:push

# Seed with sample data
npm run db:seed

# Start development server
npm run dev
```

### 7️⃣ Verify Connection

```bash
# Test database connection
npx prisma studio

# If it opens without errors, you're connected! ✅
```

### 🔧 Azure-Specific Troubleshooting

**❌ Error: "SSL connection required"**
```bash
# Solution: Add ?sslmode=require
DATABASE_URL="...?sslmode=require"
```

**❌ Error: "Connection timeout" or "Cannot reach server"**
```bash
# Solution: Check firewall rules in Azure Portal
# Make sure your IP is allowed
```

**❌ Error: "Authentication failed"**
```bash
# Solution: Azure username includes @servername
# Correct: nustadmin@your-nust-db
# URL encode the @: nustadmin%40your-nust-db
```

**❌ Error: "Database does not exist"**
```bash
# Solution: Azure creates 'postgres' database by default
# Use postgres as database name, or create a new one:
az postgres flexible-server db create \
  --resource-group nust-calculator-rg \
  --server-name your-nust-db \
  --database-name nust_calculator
```

**❌ Error: "Too many connections"**
```bash
# Solution: Azure Basic tier has connection limits
# Close unused connections or upgrade tier
# Or use connection pooling
```

### 💰 Cost Considerations

- **Free Tier**: Available for 12 months (new Azure accounts)
- **Basic Tier**: ~$25-50/month
- **Burstable Tier**: ~$15-30/month (cheapest for small projects)
- **Tip**: Stop/Start your database when not in use to save costs

### 🔗 Share Connection String with Team

**For team members:**
1. Share the connection string securely (NOT in GitHub!)
2. Each member should add it to their local `.env.local` file
3. All team members can connect to the same Azure database
4. Make sure to add their IPs to Azure firewall rules

**Alternative: Everyone uses JSON data during development**
- Keep Azure database for production/testing only
- Developers work with JSON data locally (no database needed)
- Much faster setup for new contributors!

---

## �🔧 Common Issues & Solutions

### ❌ Problem: "SSL connection required"

**Cause:** PostgreSQL database requires SSL but connection string doesn't include SSL parameters.

**Fix:**
```bash
# Add ?sslmode=require to your DATABASE_URL
DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

---

### ❌ Problem: "PrismaClient initialization failed"

**Cause:** Database URL is set but database doesn't exist or isn't accessible.

**Fix Option 1 (Easiest):** Remove database URL and use JSON data
```bash
# In .env.local, comment out or remove:
# DATABASE_URL="..."
```

**Fix Option 2:** Check your database connection
```bash
# Test if you can reach the database
npx prisma db pull
```

---

### ❌ Problem: "ECONNREFUSED" or "Connection timeout"

**Cause:** Database server is unreachable.

**Fix:**
1. Check if database server is running
2. Verify host/port in connection string
3. Check firewall settings
4. Try using JSON data instead (remove DATABASE_URL)

---

### ❌ Problem: "Module not found" or build errors

**Cause:** Dependencies not installed or outdated.

**Fix:**
```bash
# Clean install
rm -rf node_modules package-lock.json
npm install

# Regenerate Prisma Client
npm run db:generate
```

---

## 📁 Project Structure

```
├── src/
│   ├── app/              # Next.js app routes (pages)
│   ├── components/       # React components
│   ├── lib/              # Utilities & business logic
│   └── data/             # JSON data files (merit history)
├── prisma/
│   ├── schema.prisma     # Database schema
│   └── seed.ts           # Database seeding script
├── public/               # Static assets
├── .env.example          # Environment variables template
└── package.json          # Dependencies
```

---

## 🔑 Environment Variables

Create `.env.local` in root directory:

```bash
# Contact Form (Optional)
WEB3FORMS_ACCESS_KEY=your_key_here

# Database (Optional - app works without it)
DATABASE_URL="file:./dev.db"

# For PostgreSQL with SSL:
# DATABASE_URL="postgresql://user:pass@host:5432/db?sslmode=require"
```

**Get Web3Forms key:**
1. Go to https://web3forms.com
2. Enter email: maazhussain972@gmail.com
3. Get access key
4. Add to `.env.local`

---

## 🧪 Testing Your Setup

```bash
# Run development server
npm run dev

# Build for production (tests if everything compiles)
npm run build

# Run linter
npm run lint

# Generate Prisma Client (after schema changes)
npm run db:generate
```

**Visit:** http://localhost:3000

**Test these pages:**
- ✅ Homepage `/`
- ✅ Aggregate Calculator `/aggregate-calculator`
- ✅ Merit History `/merit-history`
- ✅ Admission Predictor `/admission-predictor`

---

## 🚀 Making Changes

### Before you start:
```bash
# Pull latest changes
git pull origin main

# Create a new branch for your feature
git checkout -b feature/your-feature-name
```

### After making changes:
```bash
# Stage your changes
git add .

# Commit with a clear message
git commit -m "feat: add new feature xyz"

# Push to your branch
git push origin feature/your-feature-name
```

### Then create a Pull Request on GitHub

---

## 🆘 Still Having Issues?

### Option 1: Use JSON Data Only (Simplest)
```bash
# Remove or comment out DATABASE_URL in .env.local
# App will automatically use JSON data
npm run dev
```

### Option 2: Use SQLite (Easy)
```bash
DATABASE_URL="file:./dev.db"
npm run db:generate
npm run db:push
npm run db:seed
npm run dev
```

### Option 3: Get Help
- Check existing [Issues](https://github.com/Maazhussain786/Aggregate_calculator_NUST/issues)
- Create a new issue with:
  - Your operating system
  - Node.js version (`node --version`)
  - Error message (full output)
  - What you've tried

---

## 📚 Useful Commands

```bash
# Development
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint

# Database (Prisma)
npm run db:generate      # Generate Prisma Client
npm run db:push          # Push schema to database
npm run db:migrate       # Create migration
npm run db:seed          # Seed database with sample data
npm run db:studio        # Open Prisma Studio (GUI)

# Git
git status               # Check current changes
git pull origin main     # Get latest from main
git checkout -b feat/xyz # Create new branch
git add .                # Stage all changes
git commit -m "message"  # Commit changes
git push origin branch   # Push to GitHub
```

---

## ✅ Summary: Choose Your Setup

| Option | Difficulty | Setup Time | Use Case |
|--------|-----------|------------|----------|
| **No Database** | ⭐ Easy | 2 minutes | Front-end development, UI work |
| **SQLite** | ⭐⭐ Moderate | 5 minutes | Testing database features locally |
| **PostgreSQL** | ⭐⭐⭐ Advanced | 10 minutes | Production-like testing |

**Recommended:** Start with **No Database** option - it's the fastest way to contribute!

---

**Ready to contribute?** 🎉

Start with: `npm install && npm run dev`

That's it! The app will work perfectly with JSON data.
