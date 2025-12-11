# 🚀 Vercel Deployment - Quick Setup

## ✅ Simple Solution: No Database Needed!

Your app **works perfectly without a database** on Vercel. It uses sample data from JSON files automatically.

## 📋 What to Do in Vercel Dashboard

### Step 1: Go to Environment Variables

1. In your Vercel project dashboard
2. Click **"Settings"** tab (top navigation)
3. Click **"Environment Variables"** (left sidebar)

### Step 2: Add Environment Variable

**Add this ONE variable:**

- **Name:** `NEXT_PUBLIC_SITE_URL`
- **Value:** `https://aggregate-calculator-nust.vercel.app` (or your actual Vercel URL - check the "Domains" section)
- **Environment:** Select all three (Production, Preview, Development)

### Step 3: Deploy

**Option A: Automatic (Easiest)**
- Just push your code to GitHub `main` branch
- Vercel will auto-deploy

**Option B: Manual**
1. Go to "Deployments" tab
2. Click "Redeploy" on latest deployment
3. Or click "Deploy" button

---

## ⚠️ About DATABASE_URL

**You DON'T need to set DATABASE_URL!**

- SQLite doesn't work on Vercel (that's okay!)
- Your app automatically uses sample data
- All 49 programs and merit data work perfectly
- No database setup required!

---

## ✅ That's It!

After deployment:
1. Wait 2-3 minutes for build
2. Visit your site URL
3. Everything should work!

The app will use sample data from `sampleMeritData.json` which has all your programs and merit history.

---

## 🆘 If Build Fails

If you see database-related errors during build:

1. **Temporary fix:** Add this environment variable in Vercel:
   - Name: `DATABASE_URL`
   - Value: `file:./prisma/dev.db`
   - This is just to make Prisma happy during build - it won't actually use it

2. **The app will still work** because API routes fall back to sample data

---

## 🎉 You're Done!

Your site will work perfectly on Vercel with all features:
- ✅ Aggregate Calculator
- ✅ Merit History (all 49 programs)
- ✅ Admission Predictor
- ✅ Preference Generator

All using the sample data that's already in your code!

