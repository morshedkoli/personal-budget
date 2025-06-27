#!/usr/bin/env node

// Simple database connection test script
// Run with: node scripts/test-database.js

const { PrismaClient } = require('@prisma/client')
require('dotenv').config()

const prisma = new PrismaClient({
  log: ['error', 'warn'],
})

async function testDatabase() {
  console.log('🔍 Testing database connection...')
  console.log('📍 DATABASE_URL:', process.env.DATABASE_URL ? 'Set' : 'Not set')
  
  if (!process.env.DATABASE_URL) {
    console.error('❌ DATABASE_URL environment variable is not set')
    console.log('💡 Add DATABASE_URL to your .env file')
    process.exit(1)
  }
  
  const startTime = Date.now()
  
  try {
    // Test 1: Basic connection
    console.log('\n1️⃣ Testing basic connection...')
    await prisma.$connect()
    console.log('✅ Connected to database')
    
    // Test 2: Simple database operation with timeout
    console.log('\n2️⃣ Testing database operations...')
    const queryStart = Date.now()
    
    try {
      // Use a MongoDB-compatible operation
      await Promise.race([
        prisma.$runCommandRaw({ ping: 1 }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Query timeout')), 5000)
        )
      ])
      
      const queryTime = Date.now() - queryStart
      console.log(`✅ Database ping successful (${queryTime}ms)`)
      
      if (queryTime > 2000) {
        console.log('⚠️  Database response is slow. Consider optimizing your connection.')
      }
      
    } catch (queryError) {
      if (queryError.message === 'Query timeout') {
        console.log('❌ Database ping timed out after 5 seconds')
        console.log('💡 Your database connection is too slow')
      } else {
        console.log('⚠️  Database ping failed, but connection seems OK')
        console.log('   This might be normal for some MongoDB setups')
      }
    }
    
    // Test 3: Check if users table exists
    console.log('\n3️⃣ Testing users table access...')
    try {
      const userCount = await prisma.user.count()
      console.log(`✅ Users table accessible (${userCount} users found)`)
      
      if (userCount === 0) {
        console.log('💡 No users found. You may need to register a user first.')
      }
      
    } catch (tableError) {
      if (tableError.code === 'P2021') {
        console.log('❌ Users table does not exist')
        console.log('💡 Run: npx prisma db push')
      } else {
        console.log('❌ Cannot access users table:', tableError.message)
      }
    }
    
    // Test 4: Test user lookup (similar to login)
    console.log('\n4️⃣ Testing user lookup performance...')
    try {
      const lookupStart = Date.now()
      
      const testUser = await Promise.race([
        prisma.user.findFirst({
          where: {
            email: { contains: '@' }
          },
          select: {
            id: true,
            email: true,
            name: true
          }
        }),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Lookup timeout')), 5000)
        )
      ])
      
      const lookupTime = Date.now() - lookupStart
      
      if (testUser) {
        console.log(`✅ User lookup successful (${lookupTime}ms)`)
      } else {
        console.log(`✅ User lookup completed (${lookupTime}ms) - no users with email found`)
      }
      
      if (lookupTime > 1000) {
        console.log('⚠️  User lookup is slow. Consider adding database indexes.')
      }
      
    } catch (lookupError) {
      if (lookupError.message === 'Lookup timeout') {
        console.log('❌ User lookup timed out')
        console.log('💡 This is likely the cause of your login 500 errors')
      } else {
        console.log('❌ User lookup failed:', lookupError.message)
      }
    }
    
    const totalTime = Date.now() - startTime
    console.log(`\n🎉 Database test completed in ${totalTime}ms`)
    
    // Performance recommendations
    if (totalTime > 3000) {
      console.log('\n⚠️  Performance Recommendations:')
      console.log('   • Consider using MongoDB Atlas for better performance')
      console.log('   • Check your internet connection')
      console.log('   • Restart your local MongoDB if using local setup')
    } else {
      console.log('\n✅ Database performance looks good!')
    }
    
  } catch (error) {
    console.error('\n❌ Database test failed:')
    
    if (error.code === 'P2010') {
      console.error('🔌 Connection Error: Cannot connect to database')
      console.error('   Possible causes:')
      console.error('   • MongoDB is not running')
      console.error('   • Wrong DATABASE_URL')
      console.error('   • Network connectivity issues')
      console.error('\n   Solutions:')
      console.error('   • Start MongoDB: net start MongoDB (Windows)')
      console.error('   • Use MongoDB Atlas: Update DATABASE_URL')
      console.error('   • Use Docker: docker run -d -p 27017:27017 mongo')
    } else if (error.message.includes('Server selection timeout')) {
      console.error('⏱️  Timeout Error: Database server not responding')
      console.error('   • Check if MongoDB is running on the correct port')
      console.error('   • Verify DATABASE_URL is correct')
      console.error('   • Try restarting MongoDB service')
    } else {
      console.error('   Error details:', error.message)
      console.error('   Error code:', error.code || 'Unknown')
    }
    
    console.error('\n📚 For detailed troubleshooting, see:')
    console.error('   • TROUBLESHOOTING_DATABASE.md')
    console.error('   • QUICK_FIX_GUIDE.md')
    
    process.exit(1)
    
  } finally {
    await prisma.$disconnect()
  }
}

// Handle script interruption
process.on('SIGINT', async () => {
  console.log('\n🛑 Test interrupted')
  await prisma.$disconnect()
  process.exit(0)
})

// Run the test
if (require.main === module) {
  testDatabase()
    .then(() => {
      console.log('\n🚀 Ready to test login at: http://localhost:3000/auth/login')
      process.exit(0)
    })
    .catch((error) => {
      console.error('\n💥 Test script failed:', error.message)
      process.exit(1)
    })
}

module.exports = { testDatabase }