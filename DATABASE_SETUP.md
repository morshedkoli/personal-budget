# Database Setup Guide

## Current Issue
The application is trying to connect to MongoDB Atlas, but the servers are unreachable due to connection timeouts and SSL errors. This guide provides multiple solutions.

## Solution Options

### Option 1: Local MongoDB Installation (Recommended for Development)

#### Install MongoDB Community Server
1. Download MongoDB Community Server from: https://www.mongodb.com/try/download/community
2. Install with default settings
3. MongoDB will run as a Windows service automatically

#### Verify Installation
```bash
# Check if MongoDB is running
net start | findstr MongoDB

# Connect to MongoDB
mongo
# or for newer versions:
mongosh
```

#### Current Configuration
Your `.env` file is already configured for local MongoDB:
```
DATABASE_URL="mongodb://localhost:27017/budgeting"
```

### Option 2: MongoDB Atlas (Cloud Database)

#### Fix Atlas Connection
If you prefer using MongoDB Atlas:

1. **Check Atlas Cluster Status**
   - Login to MongoDB Atlas
   - Verify cluster is running
   - Check network access settings

2. **Update Network Access**
   - Add your current IP address
   - Or add `0.0.0.0/0` for development (not recommended for production)

3. **Update Connection String**
   Replace in `.env`:
   ```
   DATABASE_URL="mongodb+srv://username:password@cluster0.xxxxx.mongodb.net/database-name?retryWrites=true&w=majority"
   ```

### Option 3: MongoDB Memory Server (Development Only)

#### Install MongoDB Memory Server
```bash
npm install --save-dev mongodb-memory-server
```

#### Update Prisma Configuration
Create `prisma/dev-db.js`:
```javascript
const { MongoMemoryServer } = require('mongodb-memory-server');

async function startDatabase() {
  const mongod = await MongoMemoryServer.create();
  const uri = mongod.getUri();
  console.log('MongoDB Memory Server URI:', uri);
  return { mongod, uri };
}

module.exports = { startDatabase };
```

## Database Initialization

After setting up your database, initialize it:

```bash
# Generate Prisma client
npm run db:generate

# Push schema to database
npm run db:push

# Optional: Open Prisma Studio to view data
npm run db:studio
```

## Environment Configuration

### Development Environment
```env
DATABASE_URL="mongodb://localhost:27017/budgeting"
NODE_ENV="development"
NEXTAUTH_URL="http://localhost:3000"
EMAIL_SERVICE="ethereal"  # For testing emails
```

### Production Environment
```env
DATABASE_URL="mongodb+srv://user:pass@cluster.mongodb.net/dbname"
NODE_ENV="production"
NEXTAUTH_URL="https://yourdomain.com"
EMAIL_SERVICE="gmail"  # Or your preferred email service
```

## Troubleshooting

### Common Issues

1. **Connection Timeout**
   - Check if MongoDB service is running
   - Verify firewall settings
   - For Atlas: Check network access whitelist

2. **Authentication Failed**
   - Verify username/password in connection string
   - Check database user permissions

3. **SSL/TLS Errors**
   - For local MongoDB: Use `mongodb://` (not `mongodb+srv://`)
   - For Atlas: Ensure proper SSL configuration

### Restart Development Server
After changing database configuration:
```bash
# Stop current server (Ctrl+C)
# Restart development server
npm run dev
```

## Quick Fix for Current Issue

The fastest solution is to install MongoDB locally:

1. Download and install MongoDB Community Server
2. Your `.env` is already configured correctly
3. Run `npm run db:push` to create the database schema
4. Restart your development server

The application should now connect successfully to your local MongoDB instance.