# 🧪 Complete Testing Guide for Fashion Vlog

## Overview
This guide provides comprehensive testing procedures for the StyleVibe fashion application frontend with deployed backend at `https://fashion-blog-mern-1.onrender.com`.

---

## 📋 Pre-Testing Checklist

- [ ] Backend is running and accessible at `https://fashion-blog-mern-1.onrender.com`
- [ ] Frontend .env files configured with correct API URL
- [ ] Backend API keys configured (HF_API_KEY, OPENROUTER_API_KEY)
- [ ] MongoDB connection working
- [ ] All npm packages installed (`npm install`)

---

## 🚀 Starting the Application

### Development Mode
```bash
npm run dev
# Vite will start at http://localhost:5173
```

### Production Build (Local Testing)
```bash
npm run build
npx http-server dist
# Test at http://localhost:8080
```

---

## 🧬 Test Cases by Feature

### 1. ✅ Authentication Flow

#### 1.1 User Signup
**Steps:**
1. Navigate to http://localhost:5173/auth
2. Click "Signup" tab
3. Fill in form:
   - Name: "Test User"
   - Age: "25"
   - Email: "testuser@example.com"
   - Password: "TestPassword123"
4. Click "Signup" button

**Expected Results:**
- ✓ Loading spinner appears
- ✓ No errors displayed
- ✓ Redirected to home page "/"
- ✓ Token stored in localStorage
- ✓ userId stored in localStorage
- ✓ User can access protected pages

**Network Verification (DevTools F12):**
- URL: `https://fashion-blog-mern-1.onrender.com/auth/signup`
- Status: 200 or 201
- Request body contains all fields
- Response includes token and userId

#### 1.2 User Login
**Steps:**
1. Navigate to http://localhost:5173/auth
2. Click "Login" tab
3. Fill in form:
   - Email: "testuser@example.com"
   - Password: "TestPassword123"
4. Click "Login" button

**Expected Results:**
- ✓ Loading spinner appears
- ✓ Redirected to home page
- ✓ Token stored in localStorage
- ✓ Can access all features

**Error Scenarios:**
- Invalid email: "Should show 'Login failed' error"
- Wrong password: "Should show 'Login failed' error"
- No internet: "Should show network error message"

#### 1.3 Input Validation
**Steps:**
1. Try signup with missing fields
2. Try login with empty email
3. Try login with empty password

**Expected Results:**
- ✓ Shows "Name and age are required for signup"
- ✓ Shows "Email and password are required"
- ✓ Submit button remains enabled for retry

#### 1.4 Error Display
**Steps:**
1. Try logging in with invalid credentials
2. Observe error message display

**Expected Results:**
- ✓ Error message displays in red alert box
- ✓ Error message clears when user starts typing
- ✓ User can retry without page reload

---

### 2. 🎨 Outfit Suggestions

#### 2.1 Generate Outfits
**Steps:**
1. Login successfully
2. Navigate to "Outfit Suggestions" page
3. Click "Generate" button
4. Wait for outfit generation (10-30 seconds)

**Expected Results:**
- ✓ Loading spinner visible
- ✓ 4 outfit cards appear with images
- ✓ Each outfit has title and description
- ✓ Heart icon to like outfit
- ✓ Trash icon to delete individual outfit
- ✓ "Clear All Data" button visible

**Network Verification:**
- URL: `https://fashion-blog-mern-1.onrender.com/outfits/suggestions/huggingface`
- Status: 200
- Response includes outfits array with image URLs
- Images load successfully

#### 2.2 Delete Individual Outfit
**Steps:**
1. Generate outfits
2. Click trash icon on any outfit card
3. Confirm deletion

**Expected Results:**
- ✓ Card disappears immediately
- ✓ Grid updates to fill space
- ✓ Data persists on page refresh (if using localStorage)
- ✓ Backend is updated

**Network Verification:**
- POST request sent to delete endpoint
- Status: 200

#### 2.3 Clear All Outfits
**Steps:**
1. Generate outfits
2. Click "Clear All Data" button
3. Click "Yes, delete all" on confirmation

**Expected Results:**
- ✓ Double confirmation dialog appears
- ✓ All outfit cards disappear
- ✓ "Clear All Data" button becomes disabled
- ✓ Empty state message appears

#### 2.4 Like Outfit
**Steps:**
1. Generate outfits
2. Click heart icon on outfit

**Expected Results:**
- ✓ Heart icon fills with color
- ✓ Heart toggles on/off on click
- ✓ Works in rapid clicks (debounced)

#### 2.5 Error Handling
**Steps:**
1. Turn off internet
2. Try to generate outfit
3. Turn on internet and retry

**Expected Results:**
- ✓ Shows network error message
- ✓ Retry button available
- ✓ Works when internet is back

---

### 3. 💬 Community Posts

#### 3.1 Create Post
**Steps:**
1. Navigate to "Community" page
2. Upload an image (drag and drop or click)
3. Enter caption: "My new outfit idea! 🔥"
4. Click "Create Post"

**Expected Results:**
- ✓ Loading spinner visible
- ✓ Form clears after successful post
- ✓ New post appears in feed immediately
- ✓ Post contains image and caption

**Network Verification:**
- URL: `https://fashion-blog-mern-1.onrender.com/posts/`
- Method: POST
- Body: FormData with image and caption
- Status: 200 or 201

#### 3.2 Like Post
**Steps:**
1. View community posts
2. Click heart icon on any post

**Expected Results:**
- ✓ Heart fills with color
- ✓ Like count increases
- ✓ Heart toggles on second click
- ✓ Like persists on page refresh

#### 3.3 Comment on Post
**Steps:**
1. Click comment icon on a post
2. Type comment: "Love this outfit!"
3. Press Enter or click Send

**Expected Results:**
- ✓ Comment appears in comment section
- ✓ Comment shows user name and timestamp
- ✓ Input field clears

#### 3.4 Save Post
**Steps:**
1. Click bookmark icon on post
2. Navigate to "Saved Posts"

**Expected Results:**
- ✓ Bookmark icon highlights
- ✓ Post appears in "Saved Posts" page
- ✓ Post persists when logging out and back in

#### 3.5 Delete Post
**Steps:**
1. Create a post
2. Click delete button (trash icon) on own post
3. Confirm deletion

**Expected Results:**
- ✓ Confirmation dialog appears
- ✓ Post disappears from feed
- ✓ Post removed from backend

#### 3.6 Drag and Drop Upload
**Steps:**
1. Click on image upload area
2. Drag image file onto the upload area
3. Release to upload

**Expected Results:**
- ✓ Upload area highlights on drag
- ✓ Image preview appears
- ✓ Image is valid for upload

---

### 4. 🤖 AI Stylist Chat

#### 4.1 Send Message
**Steps:**
1. Navigate to "AI Stylist" page
2. Type: "Suggest an outfit for a casual date"
3. Press Enter or click Send

**Expected Results:**
- ✓ User message appears in chat
- ✓ AI response appears after loading
- ✓ Messages scroll to bottom
- ✓ Timestamp shown for each message

**Network Verification:**
- URL: `https://fashion-blog-mern-1.onrender.com/api/chat/`
- Status: 200
- Response contains AI reply

#### 4.2 Upload Images to Chat
**Steps:**
1. Click image icon in chat
2. Select image file
3. Type message: "What outfit goes with this?"
4. Send

**Expected Results:**
- ✓ Image preview appears in input
- ✓ Can add/remove images before sending
- ✓ Image sent with message to AI
- ✓ AI references the image in response

#### 4.3 Quick Prompts
**Steps:**
1. Click any quick prompt button
2. Wait for AI response

**Expected Results:**
- ✓ Prompt appears as user message
- ✓ AI generates response
- ✓ Can use quick prompts multiple times

#### 4.4 Clear Chat
**Steps:**
1. Chat several messages
2. Click trash/clear icon
3. Confirm "Clear all messages?"

**Expected Results:**
- ✓ All messages disappear
- ✓ Chat history cleared from localStorage
- ✓ Can start fresh chat

#### 4.5 Chat Persistence
**Steps:**
1. Chat several messages
2. Refresh page
3. Return to chat

**Expected Results:**
- ✓ Chat history restored from localStorage
- ✓ Can continue conversation

---

### 5. 👔 Wardrobe Management

#### 5.1 Add Wardrobe Item
**Steps:**
1. Navigate to "My Wardrobe"
2. Click "Add Item" button
3. Fill in form:
   - Category: "Top"
   - Color: "Blue"
   - Size: "M"
   - Description: "Cotton T-shirt"
4. Click "Add"

**Expected Results:**
- ✓ Item appears in wardrobe list
- ✓ Categorized correctly
- ✓ Can see all items

#### 5.2 Delete Wardrobe Item
**Steps:**
1. Click delete button on wardrobe item
2. Confirm deletion

**Expected Results:**
- ✓ Item disappears from list
- ✓ Removed from backend

---

### 6. 📍 Profile Management

#### 6.1 View Profile
**Steps:**
1. Navigate to "Profile"
2. View user information

**Expected Results:**
- ✓ Shows user name, email, age
- ✓ Shows join date
- ✓ Shows user stats (posts, followers, etc.)

#### 6.2 Edit Profile
**Steps:**
1. Click "Edit Profile" button
2. Change name to "New Name"
3. Save changes

**Expected Results:**
- ✓ Profile updates immediately
- ✓ Changes persist on refresh
- ✓ Can see updated info in posts

#### 6.3 Logout
**Steps:**
1. Click "Logout" button

**Expected Results:**
- ✓ Token removed from localStorage
- ✓ Redirected to auth page
- ✓ Cannot access protected pages

---

## 🔒 Security Testing

### 1. JWT Token Handling
**Steps:**
1. Login successfully
2. Open DevTools → Application → LocalStorage
3. Verify token exists under key "token"
4. Go to Network tab and any API request
5. Check Authorization header

**Expected Results:**
- ✓ Token stored as string value
- ✓ Authorization header: `Bearer {token}`
- ✓ Token sent with every API request

### 2. Unauthorized Access
**Steps:**
1. Login successfully
2. Open DevTools Console
3. Execute: `localStorage.removeItem('token')`
4. Try to navigate to protected page
5. Refresh page

**Expected Results:**
- ✓ Redirected to /auth page
- ✓ Protected page not accessible
- ✓ Error shown to user

### 3. Token Expiration
**Steps:**
1. Get valid token from login
2. Wait for backend token expiration (usually 7 days)
3. Try any API request

**Expected Results:**
- ✓ API returns 401 status
- ✓ App redirects to /auth
- ✓ User must login again

---

## 🌐 Network & Performance Testing

### 1. API Response Times
**Steps:**
1. Open DevTools → Network tab
2. Perform various actions:
   - Login: Should be < 2 seconds
   - Generate outfits: 10-30 seconds (first), 5-15 seconds (cached)
   - Create post: < 3 seconds
   - Fetch posts: < 2 seconds

**Expected Results:**
- ✓ All requests complete within timeouts
- ✓ No hanging requests
- ✓ Proper error handling on timeout

### 2. Offline Behavior
**Steps:**
1. Go online, generate some data
2. DevTools → Network tab → Offline mode
3. Try to perform actions

**Expected Results:**
- ✓ Shows meaningful error messages
- ✓ Can retry when online
- ✓ No silent failures

### 3. Slow Network (3G)
**Steps:**
1. DevTools → Network tab → Slow 3G
2. Try various features

**Expected Results:**
- ✓ Loading indicators appear
- ✓ Features work (just slower)
- ✓ Can cancel requests if needed

---

## 🐛 Error Handling Testing

### 1. Backend Errors (500)
**Steps:**
1. Simulate backend error (or wait for one)
2. Observe error display

**Expected Results:**
- ✓ Shows "Server error" or specific error message
- ✓ User can retry
- ✓ App doesn't crash

### 2. Network Errors
**Steps:**
1. Turn off WiFi/internet
2. Try any action

**Expected Results:**
- ✓ Shows "Network error" message
- ✓ User can retry when online
- ✓ No page crash

### 3. CORS Errors
**Steps:**
1. Check Network tab for requests to wrong origin
2. Verify all requests go to correct domain

**Expected Results:**
- ✓ No CORS errors in console
- ✓ All requests to `https://fashion-blog-mern-1.onrender.com`
- ✓ Backend CORS configured for frontend domain

---

## ✨ UI/UX Testing

### 1. Responsive Design
**Steps:**
1. Open DevTools → Responsive Design Mode
2. Test at different breakpoints:
   - Mobile (320px, 768px)
   - Tablet (1024px)
   - Desktop (1920px)

**Expected Results:**
- ✓ Layout adjusts properly
- ✓ Touch targets adequate for mobile
- ✓ All features accessible
- ✓ No horizontal scroll

### 2. Loading States
**Steps:**
1. Trigger long-running operations
2. Verify loading indicators visible

**Expected Results:**
- ✓ Spinner appears during loading
- ✓ Button disabled while loading
- ✓ Loading text updates
- ✓ Spinner removed when done

### 3. Error Messages
**Steps:**
1. Trigger various errors
2. Check message clarity

**Expected Results:**
- ✓ Messages are clear and helpful
- ✓ Actionable suggestions provided
- ✓ No generic "Error" messages
- ✓ Messages can be dismissed

---

## 📊 Full Feature Test Checklist

- [ ] Authentication (signup/login/logout)
- [ ] Outfit generation and management
- [ ] Community posts (create/like/comment/save/delete)
- [ ] AI stylist chat
- [ ] Wardrobe management
- [ ] Profile management
- [ ] Error handling
- [ ] Offline behavior
- [ ] Mobile responsiveness
- [ ] Performance under load

---

## 🧮 Regression Testing (After Each Update)

- [ ] Login still works
- [ ] Generate outfits still works
- [ ] No console errors
- [ ] All images load
- [ ] API calls go to correct URL
- [ ] Error messages display properly
- [ ] Forms submit successfully
- [ ] No broken links

---

## 📝 Test Report Template

```
Date: [Date]
Tester: [Your Name]
Environment: [Dev/Staging/Production]
Backend URL: https://fashion-blog-mern-1.onrender.com

PASSED TESTS:
- [ ] Test 1
- [ ] Test 2

FAILED TESTS:
- [ ] Test X - Description
  - Error: [Error message]
  - Steps to reproduce: [Steps]
  - Expected: [Expected result]
  - Actual: [Actual result]

BLOCKERS:
- [Any blockers]

NOTES:
- [Additional notes]
```

---

## 🚀 Deployment Verification

Before deploying to production:

- [ ] All tests passing
- [ ] No console errors
- [ ] No network errors
- [ ] Performance acceptable
- [ ] Mobile responsive
- [ ] All features working
- [ ] Error messages clear
- [ ] Security checks passed

---

**Last Updated**: 2024
**Status**: Complete
