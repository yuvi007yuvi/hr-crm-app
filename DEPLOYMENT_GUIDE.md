# Vercel Deployment Guide

## 🚀 Fix for 404 Error on Page Refresh

### Problem
When you refresh pages like `/profile`, `/attendance`, etc. on Vercel, you get a 404 error. This happens because Vercel tries to find physical files at those paths, but React Router handles all routing client-side.

### ✅ Solution Applied

I've added the following files to fix this issue:

#### 1. `vercel.json` (Primary Solution)
```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```
This tells Vercel to serve `index.html` for all routes, allowing React Router to handle routing.

#### 2. `public/_redirects` (Backup Solution)
```
/*    /index.html   200
```
This is a fallback solution that also redirects all routes to index.html.

#### 3. Updated `vite.config.js`
Enhanced the Vite configuration for better production builds:
- Optimized chunk splitting for better caching
- Proper build settings for deployment
- Server configuration for development

## 📋 Deployment Steps

### Step 1: Commit Changes
```bash
git add .
git commit -m "fix: add vercel.json for SPA routing"
git push origin main
```

### Step 2: Deploy to Vercel
1. **Automatic Deployment**: If connected to GitHub, Vercel will auto-deploy
2. **Manual Deployment**: Use Vercel CLI or dashboard

### Step 3: Verify Deployment
1. Visit your Vercel URL
2. Navigate to different pages (e.g., `/profile`, `/attendance`)
3. Refresh the pages to ensure no 404 errors

## 🔧 Environment Variables

### Required Environment Variables for Vercel
Add these in Vercel Dashboard → Settings → Environment Variables:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_auth_domain
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_storage_bucket
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id

# App Configuration
VITE_APP_NAME=HRNova
VITE_APP_VERSION=1.0.0
```

### Setting Environment Variables
1. Go to Vercel Dashboard
2. Select your project
3. Go to Settings → Environment Variables
4. Add each variable with its value
5. Apply to Production, Preview, and Development

## 🛠️ Build Configuration

### Optimized Build Settings
The `vite.config.js` now includes:

```javascript
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: 'dist',
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          router: ['react-router-dom'],
          ui: ['@mui/material', '@mui/icons-material'],
          firebase: ['firebase/app', 'firebase/auth', 'firebase/firestore']
        }
      }
    }
  }
})
```

Benefits:
- **Faster Loading**: Code splitting for better performance
- **Better Caching**: Separate chunks for vendor libraries
- **Optimized Size**: Reduced bundle size

## 🔍 Troubleshooting

### If 404 Error Still Occurs

1. **Check vercel.json**: Ensure it's in the project root
2. **Redeploy**: Sometimes requires a fresh deployment
3. **Clear Cache**: Clear browser cache and try again
4. **Check Build Logs**: Look for errors in Vercel build logs

### Common Issues & Solutions

#### Issue: Build Fails
**Solution**: Check environment variables are set correctly

#### Issue: Firebase Connection Error
**Solution**: Verify Firebase configuration in environment variables

#### Issue: Images/Assets Not Loading
**Solution**: Ensure assets are in the `public` folder

#### Issue: JavaScript Errors
**Solution**: Check browser console for specific errors

## 📱 Testing Deployment

### Test Checklist
- [ ] Home page loads correctly
- [ ] All navigation links work
- [ ] Page refresh works on all routes
- [ ] Login/logout functionality works
- [ ] Firebase connection successful
- [ ] Responsive design works on mobile
- [ ] All features function as expected

### Test URLs to Verify
1. `your-domain.vercel.app/` (Homepage)
2. `your-domain.vercel.app/login` (Login page)
3. `your-domain.vercel.app/dashboard` (Dashboard)
4. `your-domain.vercel.app/profile` (Profile page)
5. `your-domain.vercel.app/attendance` (Attendance page)
6. `your-domain.vercel.app/leave-requests` (Leave requests)

### Manual Testing
1. Navigate to each page using the sidebar
2. Refresh each page using F5 or Ctrl+R
3. Use browser back/forward buttons
4. Test on mobile devices

## 🎯 Performance Optimization

### Already Implemented
- Code splitting for vendor libraries
- Optimized chunk sizes
- Disabled source maps for production
- Efficient routing configuration

### Additional Optimizations
```javascript
// Add to vite.config.js for even better performance
build: {
  rollupOptions: {
    output: {
      assetFileNames: 'assets/[name].[hash][extname]',
      chunkFileNames: 'assets/[name].[hash].js',
      entryFileNames: 'assets/[name].[hash].js'
    }
  }
}
```

## 🔐 Security Headers

The `vercel.json` includes security headers:
- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`  
- `X-XSS-Protection: 1; mode=block`

These headers improve security by preventing various attacks.

## 📊 Monitoring & Analytics

### Vercel Analytics
1. Enable Vercel Analytics in dashboard
2. Monitor page load times
3. Track user interactions
4. Monitor error rates

### Performance Monitoring
- Use Vercel's built-in performance monitoring
- Monitor Core Web Vitals
- Track deployment success rates

## 🚨 Emergency Rollback

If deployment fails:
1. Go to Vercel Dashboard
2. Select previous successful deployment
3. Click "Promote to Production"
4. Fix issues and redeploy

## 📝 Next Steps

After successful deployment:
1. **Custom Domain**: Add your custom domain in Vercel
2. **SSL Certificate**: Automatic with Vercel
3. **CDN**: Automatic global CDN
4. **Monitoring**: Set up monitoring and alerts
5. **Backup**: Regular database backups for Firebase

## 🎉 Success!

After following these steps, your HRNova application should:
- ✅ Load correctly on all routes
- ✅ Handle page refreshes without 404 errors
- ✅ Work seamlessly with React Router
- ✅ Have optimized performance
- ✅ Include security headers
- ✅ Support progressive web app features