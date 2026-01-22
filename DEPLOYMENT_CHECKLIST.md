# 🚀 Vercel Deployment - Vercel Friendly

## ✅ Setup Complete

All files configured for Vercel deployment:
- ✅ `vercel.json` - SPA routing with rewrites
- ✅ `vite.config.js` - Build optimization
- ✅ `main.js` - Environment variable support
- ✅ `.env.example` - Config template

## 🎯 Deploy in 3 Steps

### Step 1️⃣ Push to GitHub
```bash
git add .
git commit -m "Vercel friendly - SPA + env vars"
git push origin main
```

### Step 2️⃣ Deploy Frontend to Vercel
1. Go to https://vercel.com
2. New Project → Select `AmosYang123/chess`
3. **Framework**: Vite
4. **Build**: `npm run build`
5. **Output**: `dist`
6. Deploy ✅

**You'll get a URL like:** `https://chess-xxxxx.vercel.app`

### Step 3️⃣ Deploy Backend (Railway)
1. Go to https://railway.app
2. New Project → Deploy from GitHub
3. Select `AmosYang123/chess`
4. Deploy ✅

**You'll get a URL like:** `https://chess-api-xxxxx.railway.app`

## 🔗 Connect Frontend to Backend

### Update server.js
Edit line 7 with your Vercel domain:
```javascript
cors: {
    origin: "https://chess-xxxxx.vercel.app",
    methods: ["GET", "POST"]
}
```

Push:
```bash
git add server.js
git commit -m "Update CORS"
git push
```

### Set Environment Variable in Vercel
1. Vercel Dashboard → Settings → Environment Variables
2. Add: `VITE_BACKEND_URL` = `https://chess-api-xxxxx.railway.app`
3. Redeploy

## 🎮 Test
1. Open `https://chess-xxxxx.vercel.app`
2. Click "Online Play"
3. Open in another tab
4. Should connect! ✅

## 📋 Files Modified

| File | Changes |
|------|---------|
| `vercel.json` | SPA rewrites + caching headers |
| `vite.config.js` | Build optimization |
| `main.js` | Env var support for backend |
| `package.json` | Frontend-only scripts |
| `.env.example` | Config template |

## ⚡ What's Vercel Friendly?

✅ **SPA Routing** - Works with React/Vue/Angular patterns  
✅ **Static Build** - Vite handles all compilation  
✅ **Asset Caching** - Fast delivery from CDN  
✅ **Env Variables** - Supports VITE_* pattern  
✅ **No Server** - Pure frontend deployment  
✅ **Reconnection** - Socket.IO handles network issues  

## 🆘 Troubleshooting

| Problem | Solution |
|---------|----------|
| 404 on routes | Clear cache + redeploy |
| Can't connect | Check backend URL + CORS |
| Build fails | Delete node_modules + npm install |
| Still offline | Check Rails backend is running |

## 📚 Quick Links

- [Your Vercel Dashboard](https://vercel.com/dashboard)
- [Your Vercel Project](https://vercel.com/dashboard) (after deploy)
- [Railway Dashboard](https://railway.app)
- [Socket.IO Docs](https://socket.io/docs/)

---

**That's it! Your Chess app is now production-ready on Vercel!** 🎉
