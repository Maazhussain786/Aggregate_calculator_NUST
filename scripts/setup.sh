#!/bin/bash

# NUST Aggregate Calculator - Setup Script
# This script creates the .env file and initializes the database

echo "🚀 NUST Aggregate Calculator Setup"
echo "==================================="

# Create .env file if it doesn't exist
if [ ! -f .env ]; then
    echo "📝 Creating .env file..."
    cat > .env << EOF
# Database Connection - SQLite for development
DATABASE_URL="file:./dev.db"

# Site URL
NEXT_PUBLIC_SITE_URL="http://localhost:3000"
EOF
    echo "✅ .env file created"
else
    echo "⚠️  .env file already exists, skipping..."
fi

# Install dependencies
echo ""
echo "📦 Installing dependencies..."
npm install

# Generate Prisma client
echo ""
echo "🔧 Generating Prisma client..."
npm run db:generate

# Push database schema
echo ""
echo "🗄️  Pushing database schema..."
npm run db:push

# Seed database
echo ""
echo "🌱 Seeding database..."
npm run db:seed

echo ""
echo "==================================="
echo "✅ Setup complete!"
echo ""
echo "Run 'npm run dev' to start the development server"
echo "Then open http://localhost:3000 in your browser"

