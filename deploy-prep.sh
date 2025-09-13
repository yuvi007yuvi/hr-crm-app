#!/bin/bash

# HR CRM Deployment Preparation Script

echo "🚀 Preparing HR CRM for Vercel Deployment..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Check if vercel.json exists
if [ ! -f "vercel.json" ]; then
    echo "❌ Error: vercel.json not found. Please ensure the file is created."
    exit 1
fi

# Check if _redirects exists
if [ ! -f "public/_redirects" ]; then
    echo "❌ Error: public/_redirects not found. Please ensure the file is created."
    exit 1
fi

echo "✅ Configuration files found"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Run linting
echo "🔍 Running linter..."
npm run lint

# Build the project
echo "🏗️  Building project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo ""
    echo "🎉 Your HR CRM is ready for deployment!"
    echo ""
    echo "Next steps:"
    echo "1. Commit your changes: git add . && git commit -m 'feat: prepare for vercel deployment'"
    echo "2. Push to repository: git push origin main"
    echo "3. Deploy to Vercel (automatic if connected to GitHub)"
    echo "4. Set environment variables in Vercel dashboard"
    echo "5. Test all routes with page refresh"
    echo ""
    echo "📖 See DEPLOYMENT_GUIDE.md for detailed instructions"
else
    echo "❌ Build failed! Please check the errors above."
    exit 1
fi