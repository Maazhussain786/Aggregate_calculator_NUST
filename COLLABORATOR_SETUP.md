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

#### Full PostgreSQL Setup:

**Step 1:** Get a free PostgreSQL database:
- [Supabase](https://supabase.com) - Free tier
- [Neon](https://neon.tech) - Free tier
- [Railway](https://railway.app) - Free trial
- [Vercel Postgres](https://vercel.com/storage/postgres) - Free tier

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

## 🔧 Common Issues & Solutions

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
