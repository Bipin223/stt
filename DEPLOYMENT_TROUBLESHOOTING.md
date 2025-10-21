# Speech-to-Text Deployment Troubleshooting Guide

## Common Issues on Vercel/Netlify

### 1. **HTTPS Requirement**
- ✅ **Solution**: Vercel automatically provides HTTPS
- ❌ **Problem**: HTTP sites cannot access microphone
- 🔍 **Check**: Ensure your site URL starts with `https://`

### 2. **Microphone Permission Issues**

#### Symptoms:
- "Microphone access denied" errors
- Speech recognition starts but doesn't transcribe
- Browser shows microphone blocked icon

#### Solutions:
1. **Clear browser permissions**:
   - Chrome: Settings → Privacy and security → Site Settings → Microphone
   - Firefox: Settings → Privacy & Security → Permissions → Microphone
   - Safari: Preferences → Websites → Microphone

2. **Check browser console** for permission errors
3. **Test with the diagnostic page**: `/mic-test.html`

### 3. **Browser Compatibility**

#### Supported Browsers:
- ✅ Chrome (Desktop & Mobile)
- ✅ Edge (Desktop)
- ✅ Safari (Desktop & Mobile)
- ❌ Firefox (Limited support)

#### Check:
```javascript
const isSupported = 'webkitSpeechRecognition' in window || 'SpeechRecognition' in window;
```

### 4. **Network/Service Issues**

#### Common Errors:
- `service-not-allowed`: HTTPS required
- `network`: Internet connection issues
- `not-allowed`: Microphone permission denied
- `no-speech`: No audio detected
- `audio-capture`: Microphone hardware issues

### 5. **Content Security Policy (CSP)**

Our CSP headers allow:
- Microphone access
- Audio processing
- Inline scripts (required for Vite)
- HTTPS connections

## Deployment Steps

### For Vercel:
1. Push code to GitHub
2. Connect repository to Vercel
3. Deploy automatically
4. Test microphone access on deployed URL

### For Netlify:
1. Push code to GitHub
2. Connect repository to Netlify
3. Deploy automatically
4. Test microphone access on deployed URL

## Testing Checklist

### Before Deployment:
- [ ] Local build works: `npm run build`
- [ ] Local dev server works: `npm run dev`
- [ ] Microphone access works locally

### After Deployment:
- [ ] Site loads over HTTPS
- [ ] No console errors
- [ ] Microphone permission prompt appears
- [ ] Speech recognition starts successfully
- [ ] Transcription works correctly
- [ ] Test with `/mic-test.html` diagnostic page

## Diagnostic Tools

### 1. Browser Console
Check for errors related to:
- Microphone permissions
- Speech recognition initialization
- Network requests

### 2. Microphone Test Page
Visit `/mic-test.html` on your deployed site to run comprehensive tests:
- Environment check
- Permission check
- Microphone access test
- Speech recognition test

### 3. Browser Developer Tools
- **Network tab**: Check for failed requests
- **Console tab**: Look for JavaScript errors
- **Security tab**: Verify HTTPS and permissions

## Common Fixes

### 1. Permission Denied
```javascript
// Add this check before starting recognition
const micPermission = await navigator.permissions.query({ name: 'microphone' });
if (micPermission.state === 'denied') {
    alert('Please enable microphone access in browser settings');
    return;
}
```

### 2. Service Not Allowed
- Ensure site is served over HTTPS
- Check CSP headers allow microphone access

### 3. No Speech Detected
- Check microphone hardware
- Test with other applications
- Verify audio levels in browser

### 4. Network Errors
- Check internet connection
- Verify no firewall blocking
- Test on different networks

## Environment Variables

No environment variables required - everything runs client-side.

## Headers Configuration

### Vercel (vercel.json):
```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "Permissions-Policy",
          "value": "microphone=*, camera=*, geolocation=*, interest-cohort=()"
        }
      ]
    }
  ]
}
```

### Netlify (netlify.toml):
```toml
[[headers]]
  for = "/*"
  [headers.values]
    Permissions-Policy = "microphone=*, camera=*, geolocation=*, interest-cohort=()"
```

## Support

If issues persist:
1. Test with `/mic-test.html`
2. Check browser console for errors
3. Try different browsers
4. Test on different devices
5. Verify microphone works in other applications

## Performance Tips

1. **Preload recognition**: Initialize on page load
2. **Error handling**: Provide clear user feedback
3. **Fallback options**: Offer manual text input
4. **Mobile optimization**: Test on mobile devices
5. **Network resilience**: Handle connection issues gracefully