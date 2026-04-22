# 🎨 StyleVibe - Fashion Social Platform

A modern MERN stack fashion social platform with AI-powered outfit suggestions, community posts, and real-time chat features.

## ✨ Features

- 👤 **User Authentication** - Secure JWT-based signup/login
- 🎨 **AI Outfit Suggestions** - Powered by HuggingFace image generation
- 📱 **Community Posts** - Share, like, comment, and save fashion posts
- 💬 **AI Stylist Chat** - Get personalized fashion advice
- 👔 **Wardrobe Management** - Organize your clothing collection
- 💾 **Saved Outfits** - Bookmark favorite outfit suggestions
- 🎯 **HuggingFace FLUX.1 Integration** - Generate realistic outfit images

## 🚀 Quick Start

### Prerequisites
- Node.js (v16+)
- npm or yarn
- MongoDB (for backend)

### Frontend Development

```bash
# Install dependencies
npm install

# Start development server (runs on http://localhost:5173)
npm run dev

# Build for production
npm run build
```

### Backend Setup

```bash
cd backend

# Install dependencies
npm install

# Create .env file with:
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
HF_API_KEY=your_huggingface_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
PORT=5000

# Start backend server
npm start
```

## 📦 Deployment

### Frontend Deployment

The frontend is configured to work with the deployed backend at:
`https://fashion-blog-mern-1.onrender.com`

#### Option 1: Vercel (Recommended)
```bash
npm run build
vercel deploy
```

#### Option 2: Netlify
```bash
netlify deploy --prod --dir dist
```

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete instructions.

## 🧪 Testing

Before deployment, run the complete test suite:

See [TESTING_GUIDE.md](./TESTING_GUIDE.md) for comprehensive test procedures.

## 📋 Pre-Deployment Checklist

See [PRE_DEPLOYMENT_CHECKLIST.md](./PRE_DEPLOYMENT_CHECKLIST.md) for complete verification steps.

## 📁 Project Structure

```
frontend/
├── src/
│   ├── app/
│   │   ├── pages/
│   │   │   ├── AuthPage.tsx        # Login/Signup
│   │   │   ├── Community.tsx       # Social feed
│   │   │   ├── AIStylistChat.tsx   # AI chat
│   │   │   ├── OutfitSuggestions.tsx
│   │   │   ├── Profile.tsx
│   │   │   └── ...
│   │   └── components/
│   ├── config/
│   │   └── api.ts                  # API configuration
│   ├── context/
│   │   └── ChatContext.tsx
│   └── main.tsx
├── .env                            # Production config
├── .env.local                      # Development config
└── vite.config.ts

backend/
├── routes/
│   ├── auth.js                     # Authentication
│   ├── outfits.js                  # Outfit generation
│   ├── chat.js                     # Chat API
│   ├── community.js                # Community posts
│   └── ...
├── models/
│   ├── User.js
│   ├── Post.js
│   ├── Outfit.js
│   └── ...
├── utils/
│   └── huggingfaceImageGenerator.js
├── server.js
└── .env
```

## 🔧 Environment Variables

### Frontend (.env)
```env
REACT_APP_API_URL=https://fashion-blog-mern-1.onrender.com
REACT_APP_ENV=production
```

### Backend (.env)
```env
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_jwt_secret_key
HF_API_KEY=your_huggingface_api_key
OPENROUTER_API_KEY=your_openrouter_api_key
PORT=5000
```

## 🔑 API Endpoints

### Authentication
- `POST /auth/signup` - Create new user
- `POST /auth/login` - Login user
- `GET /auth/user/:userId` - Get user profile
- `PUT /auth/user/:userId` - Update profile

### Outfit Suggestions
- `POST /outfits/suggestions/huggingface` - Generate outfit suggestions
- `POST /outfits/validate/prompt` - Validate image prompt
- `POST /outfits/generate` - Generate personalized outfits
- `DELETE /outfits/:outfitId` - Delete outfit

### Community
- `POST /posts/` - Create post
- `GET /posts/` - Get all posts
- `POST /posts/:id/like` - Like post
- `POST /posts/:id/comment` - Comment on post
- `DELETE /posts/:id` - Delete post

### Chat
- `POST /api/chat/` - Send message
- `GET /api/chat/history` - Get chat history

## 📚 Documentation

- **[DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)** - Complete deployment instructions
- **[TESTING_GUIDE.md](./TESTING_GUIDE.md)** - Comprehensive testing procedures
- **[PRE_DEPLOYMENT_CHECKLIST.md](./PRE_DEPLOYMENT_CHECKLIST.md)** - Pre-deployment verification
- **[IMPLEMENTATION_GUIDE.md](./IMPLEMENTATION_GUIDE.md)** - Implementation details
- **[backend/HUGGINGFACE_GUIDE.md](./backend/HUGGINGFACE_GUIDE.md)** - HuggingFace integration guide
- **[backend/QUICKSTART.md](./backend/QUICKSTART.md)** - Backend quick start

## 🎯 Key Technologies

**Frontend:**
- React 18 + TypeScript
- Vite
- Tailwind CSS
- Axios
- React Router
- Lucide Icons

**Backend:**
- Node.js + Express
- MongoDB + Mongoose
- JWT Authentication
- HuggingFace Inference API
- OpenRouter API
- Multer (File uploads)

## 🌐 Live Deployment

- **Backend**: https://fashion-blog-mern-1.onrender.com
- **Frontend**: To be deployed

## 🐛 Troubleshooting

### Frontend Issues
- Check `.env` file has correct `REACT_APP_API_URL`
- Clear browser cache and localStorage
- Ensure backend is running and accessible
- Check DevTools Network tab for API responses

### Backend Issues
- Verify MongoDB connection string
- Check API keys are set in `.env`
- Review server logs for errors
- Ensure all routes are mounted correctly

### API Errors
- 401: JWT token invalid or expired
- 404: Endpoint not found
- 500: Server error - check logs
- CORS: Backend CORS configuration issue

## 📞 Support

For issues or questions:
1. Check the documentation files
2. Review error messages in DevTools Console
3. Check Network tab for API requests
4. Review backend server logs

## 📄 License

This project is part of a B.Tech CSE group project.

## 🙏 Credits

Built with passion for fashion and technology!

---

**Last Updated**: 2024
**Status**: ✅ Production Ready
