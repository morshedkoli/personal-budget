# Quick Database Fix - MongoDB Connection Refused

## Current Issue
Error: `No connection could be made because the target machine actively refused it. (os error 10061)`

This means MongoDB is not running on localhost:27017.

## Immediate Solutions

### Option 1: Install MongoDB Community Server (5 minutes)

1. **Download MongoDB**
   - Go to: https://www.mongodb.com/try/download/community
   - Select Windows, Version 7.0+, MSI package
   - Download and run installer

2. **Install with Default Settings**
   - Check "Install MongoDB as a Service"
   - Check "Install MongoDB Compass" (optional GUI)
   - Complete installation

3. **Verify Installation**
   ```bash
   # Check if MongoDB service is running
   net start | findstr MongoDB
   
   # Should show: MongoDB Database Server (MongoDB)
   ```

4. **Initialize Database**
   ```bash
   npm run db:push
   ```

### Option 2: Use MongoDB Atlas (Cloud) - 2 minutes

1. **Create Free Atlas Account**
   - Go to: https://www.mongodb.com/cloud/atlas
   - Sign up for free tier

2. **Create Cluster**
   - Choose free M0 cluster
   - Select region closest to you
   - Create cluster (takes 1-3 minutes)

3. **Setup Access**
   - Create database user
   - Add IP address (0.0.0.0/0 for development)
   - Get connection string

4. **Update .env**
   ```env
   DATABASE_URL="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/budgeting?retryWrites=true&w=majority"
   ```

### Option 3: Use Docker (if Docker is installed)

```bash
# Run MongoDB in Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Initialize database
npm run db:push
```

### Option 4: Use SQLite (Fastest - 30 seconds)

1. **Update Prisma Schema**
   ```prisma
   // In prisma/schema.prisma
   datasource db {
     provider = "sqlite"
     url      = "file:./dev.db"
   }
   ```

2. **Update Models** (remove MongoDB-specific fields)
   ```prisma
   model User {
     id               Int       @id @default(autoincrement())
     // Remove: @map("_id") @db.ObjectId
     // Change all String @db.ObjectId to Int
   }
   ```

3. **Regenerate Client**
   ```bash
   npm run db:generate
   npm run db:push
   ```

## Recommended Quick Fix

**For immediate development**: Use Option 4 (SQLite)
**For production-like setup**: Use Option 1 (Local MongoDB)
**For cloud deployment**: Use Option 2 (Atlas)

## After Database Setup

1. **Restart Development Server**
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

2. **Test Database Connection**
   - Try registering a new user
   - Check if password reset emails work
   - Verify no connection errors in terminal

## Troubleshooting

### MongoDB Service Not Starting
```bash
# Start MongoDB service manually
net start MongoDB

# If service doesn't exist, reinstall MongoDB
```

### Port 27017 Already in Use
```bash
# Check what's using port 27017
netstat -ano | findstr :27017

# Kill process if needed
taskkill /PID <process_id> /F
```

### Atlas Connection Issues
- Verify username/password in connection string
- Check network access whitelist
- Ensure cluster is running (not paused)

## Next Steps After Fix

1. Test all authentication flows
2. Verify email functionality
3. Check dashboard data loading
4. Run full application test

Choose the option that best fits your development environment and time constraints.