#!/bin/bash

# 🚀 Quick Deployment Script for Speech-to-Text App

echo "🎤 Speech-to-Text App Deployment Script"
echo "======================================="

# Check if git is initialized
if [ ! -d ".git" ]; then
    echo "📁 Initializing Git repository..."
    git init
    git add .
    git commit -m "Initial commit - Enhanced Speech-to-Text App with auto-detection and editing"
else
    echo "📁 Git repository already exists"
fi

# Build the project
echo "🔨 Building the project..."
npm run build

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
else
    echo "❌ Build failed! Please fix errors before deploying."
    exit 1
fi

echo ""
echo "🚀 Ready for deployment!"
echo ""
echo "Choose your deployment method:"
echo "1. Vercel (Recommended)"
echo "2. Netlify" 
echo "3. GitHub Pages"
echo ""
echo "📋 Next steps:"
echo "1. Push your code to GitHub"
echo "2. Connect your repository to your chosen platform"
echo "3. Add environment variable: VITE_GEMINI_API_KEY"
echo "4. Deploy!"
echo ""
echo "📖 See DEPLOYMENT.md for detailed instructions"