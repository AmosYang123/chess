# Vercel Deployment Checklist

## ✅ Completed Setup

### Configuration Files Created
- [x] `vercel.json` - Vercel build configuration
- [x] `.gitignore` - Excludes node_modules, dist, env files
- [x] `api/index.js` - Basic API health check endpoints
- [x] `README.md` - Comprehensive deployment guide

### package.json Updated
- [x] Added `start` script for server
- [x] Added `vercel-build` script
- [x] All dependencies listed (express, socket.io, vite)

## 🚀 Deployment Instructions

### Step 1: Commit Changes
```bash
git add .
git commit -m "Prepare for Vercel deployment"
git push origin main
```

### Step 2: Deploy Frontend to Vercel
1. Go to https://vercel.com/dashboard
2. Click "Add New..." → "Project"
3. Import GitHub repository: `AmosYang123/chess`
4. Configure:
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
5. Click "Deploy"

### Step 3: Deploy Backend (IMPORTANT!)
Socket.IO requires persistent connections, which Vercel's serverless doesn't support.

**Option A: Railway.app (Recommended)**
1. Go to https://railway.app
2. Create new project
3. Deploy from GitHub: `AmosYang123/chess`
4. Set start command: `npm start`
5. Add domain and note the URL

**Option B: Render.com**
1. Go to https://render.com
2. New Web Service
3. Connect GitHub repo
4. Environment: Node
5. Build: `npm install`
6. Start: `npm start`

### Step 4: Update Frontend to Connect to Backend
Update `main.js` Socket.IO connection:

```javascript
// Development
const socket = io('http://localhost:3000');

// Production - replace with your backend URL
const socket = io('https://your-backend-url.railway.app');
```

### Step 5: Update CORS in server.js
```javascript
const io = new Server(server, {
    cors: {
        origin: "https://your-vercel-domain.vercel.app",
        methods: ["GET", "POST"]
    }
});
```

## 📋 Current Project Status

### Frontend
- ✅ Vite build configured
- ✅ All assets included
- ✅ Ready for Vercel static hosting

### Backend
- ✅ Express server ready
- ✅ Socket.IO configured
- ⚠️ Requires separate hosting (not on Vercel)

### Features
- ✅ Real-time multiplayer chess
- ✅ WebSocket communication
- ✅ Responsive UI
- ✅ Game logic complete

## ⚠️ Important Considerations

### WebSocket on Serverless
- Vercel doesn't support persistent WebSocket connections in serverless
- Backend MUST be hosted on a platform that supports long-lived connections
- Frontend can be static on Vercel

### Domain Configuration
- Note frontend domain (*.vercel.app)
- Update backend CORS origin
- Update Socket.IO connection URL in frontend

### Environment Variables
When needed, add to Vercel project settings:
```
VITE_BACKEND_URL=https://your-backend-url.railway.app
```

Then update `main.js`:
```javascript
const socket = io(import.meta.env.VITE_BACKEND_URL || 'http://localhost:3000');
```

## 🔧 Troubleshooting

**Build fails: "Cannot find module"**
- Ensure all dependencies in package.json
- Run `npm install` locally first

**Socket connection refused**
- Check backend is running on correct host/port
- Verify CORS settings match frontend domain
- Check firewall/network settings

**Static files 404**
- Verify dist/ folder has built assets
- Check vercel.json public directory

## 📚 Resources

- [Vercel Docs](https://vercel.com/docs)
- [Socket.IO Deployment](https://socket.io/docs/v4/deployment/)
- [Railway.app Docs](https://docs.railway.app)
- [Render.com Docs](https://render.com/docs)

## 🎯 Next Steps

1. ✅ Commit all changes
2. Deploy frontend to Vercel
3. Choose backend host (Railway/Render)
4. Deploy backend
5. Update connection URLs
6. Test multiplayer functionality
7. Monitor logs for any issues
