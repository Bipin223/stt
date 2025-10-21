# 🚀 Deployment Guide

## Quick Deploy Options

### Option 1: Vercel (Recommended - Easiest)

#### Step 1: Push to GitHub
```bash
# Initialize git if not already done
git init
git add .
git commit -m "Initial commit - Speech to Text App"

# Create GitHub repository and push
git remote add origin https://github.com/YOUR_USERNAME/speech-to-text-app.git
git branch -M main
git push -u origin main
```

#### Step 2: Deploy to Vercel
1. Go to [vercel.com](https://vercel.com)
2. Sign up/Login with GitHub
3. Click "New Project"
4. Import your GitHub repository
5. **IMPORTANT**: Add environment variable:
   - Name: `VITE_GEMINI_API_KEY`
   - Value: `YOUR_GEMINI_API_KEY`
6. Click "Deploy"

✅ **Done!** Your app will be live at `https://your-app-name.vercel.app`

---

### Option 2: Netlify

#### Step 1: Push to GitHub (same as above)

#### Step 2: Deploy to Netlify
1. Go to [netlify.com](https://netlify.com)
2. Sign up/Login with GitHub
3. Click "New site from Git"
4. Choose your repository
5. Build settings:
   - Build command: `npm run build`
   - Publish directory: `dist`
6. **IMPORTANT**: Add environment variable:
   - Name: `VITE_GEMINI_API_KEY`
   - Value: `YOUR_GEMINI_API_KEY`
7. Click "Deploy site"

---

### Option 3: GitHub Pages (Free but requires manual setup)

#### Step 1: Install GitHub Pages deployment tool
```bash
npm install --save-dev gh-pages
```

#### Step 2: Update package.json
Add these scripts to package.json:
```json
{
  "scripts": {
    "predeploy": "npm run build",
    "deploy": "gh-pages -d dist"
  },
  "homepage": "https://YOUR_USERNAME.github.io/speech-to-text-app"
}
```

#### Step 3: Deploy
```bash
npm run deploy
```

⚠️ **Note**: GitHub Pages doesn't support environment variables securely, so you'd need to hardcode the API key (not recommended for production).

---

## 🔒 Security Considerations

### Environment Variables
- ✅ **Vercel/Netlify**: Secure environment variable storage
- ❌ **GitHub Pages**: No secure environment variables

### API Key Protection
Your Gemini API key will be visible in the client-side code. Consider:
1. **API Key Restrictions**: Restrict your Gemini API key to specific domains
2. **Usage Monitoring**: Monitor API usage in Google Cloud Console
3. **Rate Limiting**: Implement client-side rate limiting

---

## 🌐 Custom Domain (Optional)

### Vercel
1. Go to your project dashboard
2. Click "Settings" → "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

### Netlify
1. Go to "Domain settings"
2. Add custom domain
3. Configure DNS records

---

## 🔧 Build Optimization

The app is already optimized with:
- ✅ Vite build optimization
- ✅ Code splitting
- ✅ Asset optimization
- ✅ Gzip compression
- ✅ Cache headers (Vercel)

---

## 📊 Monitoring

### Vercel Analytics
- Enable in project settings
- Track page views and performance

### Error Monitoring
Consider adding:
- Sentry for error tracking
- LogRocket for user session recording

---

## 🚨 Troubleshooting

### Common Issues:

1. **Microphone not working on deployed site**
   - Ensure HTTPS is enabled (automatic on Vercel/Netlify)
   - Check browser permissions

2. **API key not working**
   - Verify environment variable name: `VITE_GEMINI_API_KEY`
   - Check API key restrictions in Google Cloud Console

3. **Build fails**
   - Check Node.js version compatibility
   - Verify all dependencies are in package.json

4. **App not loading**
   - Check browser console for errors
   - Verify build output in `dist` folder

---

## 📱 Mobile Considerations

The app works on mobile devices but consider:
- Touch-friendly UI improvements
- Mobile-specific microphone handling
- Responsive design enhancements

---

## 🔄 Continuous Deployment

Both Vercel and Netlify offer automatic deployments:
- Push to `main` branch → Automatic deployment
- Pull request previews
- Rollback capabilities

---

## 📈 Performance Tips

1. **Lazy Loading**: Consider lazy loading components
2. **Service Worker**: Add for offline functionality
3. **CDN**: Leverage Vercel/Netlify CDN
4. **Image Optimization**: Optimize any images you add

---

## 🎯 Next Steps After Deployment

1. Test on multiple devices and browsers
2. Set up monitoring and analytics
3. Configure custom domain (optional)
4. Add error tracking
5. Monitor API usage and costs
6. Consider adding user authentication for usage tracking