# 🚀 Deployment Checklist

## Pre-Deployment ✅

- [ ] App works locally (`npm run dev`)
- [ ] Build succeeds (`npm run build`)
- [ ] All features tested (recording, transcription, editing)
- [ ] Gemini API key is working
- [ ] No console errors
- [ ] Responsive design tested

## GitHub Setup ✅

- [ ] Create GitHub repository
- [ ] Push code to GitHub
- [ ] Repository is public (for free deployments)

## Vercel Deployment (Recommended) ✅

### Quick Setup:
1. [ ] Go to [vercel.com](https://vercel.com)
2. [ ] Sign up with GitHub
3. [ ] Click "New Project"
4. [ ] Import your repository
5. [ ] Add environment variable:
   - Name: `VITE_GEMINI_API_KEY`
   - Value: Your actual API key
6. [ ] Click "Deploy"

### Verification:
- [ ] Deployment successful
- [ ] App loads on deployed URL
- [ ] Microphone permission works (HTTPS)
- [ ] Recording and transcription work
- [ ] No console errors on deployed version

## Alternative: Netlify ✅

1. [ ] Go to [netlify.com](https://netlify.com)
2. [ ] Sign up with GitHub
3. [ ] Drag & drop `dist` folder OR connect GitHub
4. [ ] Add environment variable: `VITE_GEMINI_API_KEY`
5. [ ] Test deployed app

## Post-Deployment ✅

- [ ] Test on different devices
- [ ] Test on different browsers
- [ ] Verify microphone works on mobile
- [ ] Check API usage in Google Cloud Console
- [ ] Set up domain (optional)
- [ ] Add to portfolio/share with others

## Security Checklist ✅

- [ ] API key added as environment variable (not hardcoded)
- [ ] API key restrictions set in Google Cloud Console
- [ ] HTTPS enabled (automatic on Vercel/Netlify)
- [ ] Monitor API usage for unexpected spikes

## Performance Checklist ✅

- [ ] App loads quickly
- [ ] Recording starts without delay
- [ ] Transcription completes in reasonable time
- [ ] No memory leaks during extended use
- [ ] Works well on mobile devices

## Troubleshooting Common Issues 🔧

### "Microphone not working"
- Ensure HTTPS is enabled
- Check browser permissions
- Test on different browsers

### "API key not found"
- Verify environment variable name: `VITE_GEMINI_API_KEY`
- Check deployment platform environment variables
- Redeploy after adding environment variable

### "Build fails"
- Check Node.js version compatibility
- Verify all dependencies in package.json
- Check for TypeScript errors

### "App not loading"
- Check browser console for errors
- Verify build output exists
- Check deployment logs

## Success! 🎉

Your Speech-to-Text app is now live and ready to use!

**Next Steps:**
- Share the URL with others
- Monitor usage and performance
- Consider adding analytics
- Plan future enhancements