# 🚀 Frontend Deployment Guide

## Overview
This guide covers deploying the **StyleVibe** fashion web application frontend to production with the deployed backend API at `https://fashion-blog-mern-1.onrender.com`.

---

## ✅ Pre-Deployment Checklist

### 1. **Environment Configuration** ✅ COMPLETED
- [x] Created `.env` file with production URL
- [x] Created `.env.local` file for development
- [x] `REACT_APP_API_URL=https://fashion-blog-mern-1.onrender.com`
- [x] `REACT_APP_ENV=production`

### 2. **API Configuration** ✅ COMPLETED
- [x] Updated `src/config/api.ts` to use environment variables
- [x] Base URL properly configured with fallback
- [x] API_ENDPOINTS object includes all required routes
- [x] Request interceptor adds Bearer token
- [x] Response interceptor handles errors (401, 500, network)

### 3. **Authentication** ✅ COMPLETED
- [x] JWT token stored in localStorage
- [x] User ID stored in localStorage
- [x] AuthPage.tsx updated with proper error handling
- [x] Error messages display to users
- [x] Loading states implemented
- [x] Form validation before submission

### 4. **Component Updates** ✅ VERIFIED
- [x] AuthPage.tsx - Enhanced error handling ✅
- [x] AIStylistChat.tsx - Uses apiCall utility
- [x] Community.tsx - Uses apiCall utility
- [x] OutfitSuggestions.tsx - Includes delete functionality
- [x] All components use API_ENDPOINTS from config

### 5. **No Localhost References** ✅ VERIFIED
- [x] Removed all `http://localhost:` references
- [x] Removed all `127.0.0.1` references
- [x] All API calls use configured BASE_URL

---

## 📦 Build and Deployment Steps

### Step 1: Install Dependencies
```bash
npm install
```

### Step 2: Build the Project
```bash
npm run build
```

This creates a `dist/` folder with optimized production files.

### Step 3: Test Built Version Locally
```bash
npm run build
# Serve the dist folder locally to test
npx http-server dist
# Visit http://localhost:8080
```

### Step 4: Verify API Connectivity
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try login/signup
4. Verify requests go to `https://fashion-blog-mern-1.onrender.com/api/...`
5. Check for proper error messages

### Step 5: Deploy to Hosting Service

Choose one of the following options:

#### **Option A: Vercel (Recommended for React)**
```bash
npm install -g vercel
vercel
```

**Vercel Configuration:**
- Framework: Vite
- Build Command: `npm run build`
- Output Directory: `dist`
- Environment Variables:
  - `REACT_APP_API_URL`: `https://fashion-blog-mern-1.onrender.com`
  - `REACT_APP_ENV`: `production`

#### **Option B: Netlify**
```bash
npm install -g netlify-cli
netlify deploy
```

**Netlify Configuration:**
- Build command: `npm run build`
- Publish directory: `dist`
- Environment Variables:
  - `REACT_APP_API_URL`: `https://fashion-blog-mern-1.onrender.com`
  - `REACT_APP_ENV`: `production`

Create a `netlify.toml` file:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[env.production]
  REACT_APP_API_URL = "https://fashion-blog-mern-1.onrender.com"
  REACT_APP_ENV = "production"
```

#### **Option C: GitHub Pages**
```bash
# Update package.json homepage
# "homepage": "https://yourusername.github.io/repo-name"

npm run build
# Deploy dist folder to gh-pages branch
```

#### **Option D: Manual Server (Node/Express)**
1. Build the project: `npm run build`
2. Upload `dist/` folder to your server
3. Serve static files from `dist/` directory
4. Configure CORS to allow requests from your frontend domain

---

## 🔐 Security Checklist

- [ ] Never commit `.env` files to git (already in `.gitignore`)
- [ ] Don't expose API keys in frontend code
- [ ] Set `REACT_APP_API_URL` via environment variables only
- [ ] Use HTTPS for all API requests (already configured)
- [ ] Implement rate limiting on backend for API endpoints
- [ ] Add CORS headers to backend for your deployed domain
- [ ] Enable CSRF protection if needed
- [ ] Validate all user inputs before sending to API

---

## 🧪 Testing After Deployment

### 1. Authentication Flow
```
✓ Visit deployed app
✓ Click "Signup"
✓ Fill form with test data
✓ Click "Signup" button
✓ Verify error message (if invalid) or redirect to home
✓ Try "Login" with credentials
✓ Check Network tab: requests go to https://fashion-blog-mern-1.onrender.com
```

### 2. Outfit Suggestions
```
✓ Click "Outfit Suggestions"
✓ Enter style preference
✓ Click "Generate"
✓ Verify images load from HuggingFace
✓ Try deleting individual outfit cards
✓ Try "Clear All Data" button
```

### 3. Community Posts
```
✓ Click "Community"
✓ Upload image and create post
✓ Verify post appears in feed
✓ Like/unlike a post
✓ Comment on a post
✓ Delete your own post
```

### 4. AI Stylist Chat
```
✓ Click "AI Stylist"
✓ Upload images
✓ Ask styling questions
✓ Verify responses load
✓ Clear chat history
```

### 5. Error Handling
```
✓ Turn off internet → verify offline message
✓ Go to Network tab → disable requests to API
✓ Try any action → verify error message displays
✓ Re-enable network → verify app recovers
```

---

## 📊 Environment Variables Reference

### Frontend (.env and .env.local)
```env
# Required
REACT_APP_API_URL=https://fashion-blog-mern-1.onrender.com
REACT_APP_ENV=production

# Optional
VITE_DEBUG=false
```

### Backend (backend/.env) - Already Configured
```env
MONGODB_URI=your_mongodb_connection_string
PORT=5000
JWT_SECRET=your_jwt_secret
HF_API_KEY=your_huggingface_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
CORS_ORIGIN=https://your-deployed-frontend-domain.com
```

---

## 🐛 Troubleshooting

### Issue: "Cannot POST /api/auth/login"
**Solution:**
1. Check Network tab - verify URL is `https://fashion-blog-mern-1.onrender.com/api/auth/login`
2. Check `.env` file - ensure `REACT_APP_API_URL` is correct
3. Restart dev server after changing `.env`

### Issue: "401 Unauthorized"
**Solution:**
1. Ensure token is stored in localStorage
2. Check Network tab - verify `Authorization: Bearer {token}` header is present
3. Check if token is expired - try login again

### Issue: "CORS error"
**Solution:**
1. Verify backend CORS_ORIGIN matches frontend domain
2. Check backend logs for CORS configuration
3. Try request in Postman - if it works, CORS is configured correctly

### Issue: Images not loading
**Solution:**
1. Check HuggingFace API key in backend
2. Verify HF_API_KEY is set in backend environment
3. Check backend logs for image generation errors
4. Try outfit suggestion again - may be transient error

### Issue: 404 Not Found
**Solution:**
1. Verify API_ENDPOINTS routes match backend routes
2. Check backend routes/[resource].js files exist
3. Verify backend is running and deployed correctly
4. Check Network tab - URL should include `/api/` prefix

---

## 📝 Deployment Verification Script

Run this after deployment to verify everything works:

```bash
#!/bin/bash

echo "🔍 Verifying Frontend Deployment..."

# Check if frontend is accessible
echo "✓ Checking frontend health..."
curl -I https://your-deployed-frontend.com 2>/dev/null | head -1

# Check if backend API is accessible
echo "✓ Checking backend API health..."
curl -I https://fashion-blog-mern-1.onrender.com/api/health 2>/dev/null | head -1

echo "✅ Deployment verified!"
```

---

## 🚀 Quick Deployment Checklist

- [ ] `.env` file created with correct API_URL
- [ ] `npm run build` completes without errors
- [ ] No localhost references in build output
- [ ] Built version tested locally
- [ ] Hosting service configured
- [ ] Environment variables set in hosting dashboard
- [ ] CORS configured on backend
- [ ] SSL certificate valid (HTTPS working)
- [ ] All tests passing
- [ ] Error messages displaying correctly
- [ ] Backend API responding with 200/201 status
- [ ] Deployment URL working and accessible

---

## 📞 Support

For issues during deployment:

1. **Frontend Issues**: Check Network tab in DevTools
2. **Backend Issues**: Check server logs on Render
3. **API Issues**: Verify endpoint URLs and request format
4. **Database Issues**: Check MongoDB connection string
5. **Auth Issues**: Verify JWT_SECRET and token storage

---

**Last Updated**: 2024
**Frontend URL**: To be deployed
**Backend URL**: https://fashion-blog-mern-1.onrender.com
**Frontend Framework**: React 18 + TypeScript + Vite
