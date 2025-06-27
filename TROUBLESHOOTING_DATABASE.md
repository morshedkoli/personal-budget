# 🔧 Database Troubleshooting Guide

## Current Issue: Database Query Timeout

**Error:** `Database query timeout` in `/api/auth/login`  
**Status:** 500 Internal Server Error  
**Cause:** MongoDB connection issues

---

## 🚨 Quick Diagnosis

### Step 1: Check Database Health
Visit: **http://localhost:3000/api/health/database**

This endpoint will tell you:
- ✅ Database connection status
- ⏱️ Response time
- 📊 User count
- 🔍 Specific error details

### Step 2: Identify Your Setup
Check your `.env` file:
```bash
# Current configuration
DATABASE_URL="mongodb://localhost:27017/budgeting"
```

---

## 🛠️ Solutions (Choose Based on Your Setup)

### Option A: MongoDB Atlas (Cloud) - Recommended

**When to use:** You want a managed database solution

1. **Create MongoDB Atlas Account:**
   - Go to [MongoDB Atlas](https://cloud.mongodb.com/)
   - Create free cluster (M0 Sandbox)

2. **Get Connection String:**
   ```
   mongodb+srv://<username>:<password>@<cluster>.mongodb.net/budgeting
   ```

3. **Update `.env` file:**
   ```bash
   DATABASE_URL="mongodb+srv://your-username:your-password@your-cluster.mongodb.net/budgeting"
   ```

4. **Setup Database:**
   ```bash
   npx prisma db push
   npm run dev
   ```

**✅ Expected Result:** Login works in < 2 seconds

---

### Option B: Local MongoDB Installation

**When to use:** You prefer local development

#### Windows:
1. **Download MongoDB Community:**
   - Visit [MongoDB Download Center](https://www.mongodb.com/try/download/community)
   - Download Windows MSI installer

2. **Install and Start:**
   ```powershell
   # Install MongoDB as Windows Service
   # During installation, check "Install MongoDB as a Service"
   
   # Start MongoDB service
   net start MongoDB
   ```

3. **Verify Installation:**
   ```powershell
   # Check if MongoDB is running
   netstat -an | findstr :27017
   ```

4. **Setup Database:**
   ```bash
   npx prisma db push
   npm run dev
   ```

#### Alternative: Manual Start
```powershell
# Create data directory
mkdir C:\data\db

# Start MongoDB manually
mongod --dbpath C:\data\db
```

---

### Option C: Docker MongoDB (Quick Setup)

**When to use:** You have Docker installed

1. **Install Docker Desktop** (if not installed)

2. **Start MongoDB Container:**
   ```bash
   docker run -d -p 27017:27017 --name mongodb-budgeting mongo:latest
   ```

3. **Verify Container:**
   ```bash
   docker ps
   # Should show mongodb-budgeting container running
   ```

4. **Setup Database:**
   ```bash
   npx prisma db push
   npm run dev
   ```

**Stop Container:**
```bash
docker stop mongodb-budgeting
```

**Restart Container:**
```bash
docker start mongodb-budgeting
```

---

## 🧪 Testing Your Fix

### 1. Health Check
```bash
# Visit in browser:
http://localhost:3000/api/health/database

# Should return:
{
  "status": "healthy",
  "database": {
    "connected": true,
    "responseTime": "<100ms",
    "userCount": 0
  }
}
```

### 2. Test Login
1. Go to: `http://localhost:3000/auth/register`
2. Create a test account
3. Go to: `http://localhost:3000/auth/login`
4. Login with test credentials
5. Should redirect to dashboard (no 500 error)

### 3. Check Logs
```bash
# In terminal running npm run dev
# Should see:
✓ User logged in successfully
# Instead of:
❌ Login error: Database query timeout
```

---

## 🔍 Advanced Troubleshooting

### Common Error Messages

#### "Server selection timeout"
**Cause:** MongoDB not running or wrong connection string  
**Fix:** Start MongoDB or update DATABASE_URL

#### "Database query timeout"
**Cause:** Slow database response  
**Fix:** Check network, restart MongoDB, or use Atlas

#### "P2021: Table does not exist"
**Cause:** Database schema not created  
**Fix:** Run `npx prisma db push`

#### "ECONNREFUSED"
**Cause:** Nothing listening on port 27017  
**Fix:** Start MongoDB service

### Performance Issues

#### Slow Queries (> 2 seconds)
1. **Check MongoDB Atlas tier** (upgrade if needed)
2. **Restart local MongoDB**
3. **Check system resources** (RAM, CPU)
4. **Use MongoDB Compass** to monitor queries

#### Memory Issues
```bash
# Restart Prisma client
npx prisma generate
npm run dev
```

---

## 🚀 Production Deployment

### Vercel Deployment
1. **Use MongoDB Atlas** (required for Vercel)
2. **Set Environment Variables:**
   ```
   DATABASE_URL=mongodb+srv://...
   JWT_SECRET=your-secret
   NEXTAUTH_URL=https://your-app.vercel.app
   ```
3. **Deploy:**
   ```bash
   vercel --prod
   ```

### Environment Variables Checklist
- ✅ `DATABASE_URL` points to Atlas
- ✅ `JWT_SECRET` is secure (32+ characters)
- ✅ `NEXTAUTH_URL` matches your domain
- ✅ No localhost URLs in production

---

## 📞 Getting Help

### Still Having Issues?

1. **Check Health Endpoint:**
   - Visit `/api/health/database`
   - Share the error response

2. **Check Browser Console:**
   - Open Developer Tools
   - Look for network errors
   - Check login request response

3. **Check Server Logs:**
   ```bash
   # Look for these in terminal:
   "Database error during login:"
   "Login error:"
   ```

### Quick Commands Reference
```bash
# Test database connection
npx prisma db push

# Reset database
npx prisma db push --force-reset

# Generate Prisma client
npx prisma generate

# Start development server
npm run dev

# Check MongoDB status (Windows)
net start MongoDB

# Check port 27017
netstat -an | findstr :27017
```

---

**💡 Pro Tip:** For development, MongoDB Atlas free tier is often more reliable than local installations and requires zero setup.