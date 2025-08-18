#!/bin/bash

# Database setup script for AI Fiesta

echo "🚀 Setting up AI Fiesta database..."

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "❌ .env.local file not found. Please copy example.env.local to .env.local and configure your environment variables."
    exit 1
fi

# Check if DATABASE_URL is set
if ! grep -q "^DATABASE_URL=" .env.local; then
    echo "❌ DATABASE_URL not found in .env.local. Please set your PostgreSQL connection string."
    exit 1
fi

echo "📦 Installing dependencies..."
pnpm install

echo "🗄️  Generating database schema..."
pnpm db:generate

echo "🔄 Running database migrations..."
pnpm db:migrate

echo "✅ Database setup complete!"
echo ""
echo "🌟 You can now start the development server with:"
echo "   pnpm dev"
echo ""
echo "📊 To view your database, run:"
echo "   pnpm db:studio"
