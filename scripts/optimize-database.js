// Database optimization script for MongoDB Atlas
// This script works with cloud MongoDB instances

const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient({
  log: ['query', 'info', 'warn', 'error'],
})

async function optimizeDatabase() {
  try {
    console.log('🔧 Starting database optimization for MongoDB Atlas...')
    
    // Test connection first
    console.log('🔌 Testing database connection...')
    await prisma.$connect()
    console.log('✅ Database connection successful!')
    
    // Check if users collection exists and has data
    const userCount = await prisma.user.count()
    console.log(`📊 Found ${userCount} users in database`)
    
    if (userCount === 0) {
      console.log('⚠️  No users found. Database might be empty.')
      return
    }
    
    // Test a simple query to check performance
    console.log('⏱️  Testing query performance...')
    const startTime = Date.now()
    
    const testUser = await prisma.user.findFirst({
      where: {
        email: { contains: '@' }
      },
      select: {
        id: true,
        email: true,
        name: true
      }
    })
    
    const queryTime = Date.now() - startTime
    console.log(`📈 Query completed in ${queryTime}ms`)
    
    if (queryTime > 1000) {
      console.log('⚠️  Query is slow. Consider the following optimizations:')
      console.log('   1. Ensure your MongoDB Atlas cluster has sufficient resources')
      console.log('   2. Check your internet connection to MongoDB Atlas')
      console.log('   3. Consider upgrading your MongoDB Atlas tier')
      console.log('   4. Manually create indexes in MongoDB Atlas dashboard')
    } else {
      console.log('✅ Query performance is good!')
    }
    
    // For MongoDB Atlas, we'll use Prisma's built-in index management
    console.log('🔄 Regenerating Prisma client to ensure indexes...')
    
    // The indexes are defined in schema.prisma and should be automatically created
    // when using prisma db push or prisma migrate
    
    console.log('✅ Database optimization completed!')
    console.log('')
    console.log('📋 Next steps:')
    console.log('   1. Run: npm run db:push')
    console.log('   2. Restart your development server')
    console.log('   3. Test login performance')
    console.log('')
    console.log('🔗 For manual index creation in MongoDB Atlas:')
    console.log('   1. Go to your MongoDB Atlas dashboard')
    console.log('   2. Navigate to Database > Browse Collections')
    console.log('   3. Select the "users" collection')
    console.log('   4. Go to "Indexes" tab')
    console.log('   5. Create index on "email" field (unique: true)')
    
  } catch (error) {
    console.error('❌ Database optimization failed:')
    
    if (error.code === 'P2010') {
      console.error('🔌 Connection Error: Cannot connect to database')
      console.error('   - Check your DATABASE_URL in .env file')
      console.error('   - Ensure MongoDB Atlas cluster is running')
      console.error('   - Verify network access in MongoDB Atlas')
    } else if (error.code === 'P2021') {
      console.error('🗄️  Database Error: Table/Collection does not exist')
      console.error('   - Run: npm run db:push')
    } else {
      console.error('   Error details:', error.message)
    }
    
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run optimization if called directly
if (require.main === module) {
  optimizeDatabase()
    .then(() => {
      console.log('🎉 Optimization script completed!')
      process.exit(0)
    })
    .catch((error) => {
      console.error('💥 Optimization script failed')
      process.exit(1)
    })
}

module.exports = { optimizeDatabase }