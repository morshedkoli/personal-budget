import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const startTime = Date.now()
    
    // Test basic connection
    await prisma.$connect()
    
    // Test a simple query with timeout
    const result = await Promise.race([
      prisma.$queryRaw`SELECT 1 as test`,
      new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Health check timeout')), 3000)
      )
    ])
    
    const responseTime = Date.now() - startTime
    
    // Test user collection access
    let userCount = 0
    try {
      userCount = await prisma.user.count()
    } catch (error) {
      console.warn('Could not count users:', error)
    }
    
    return NextResponse.json({
      status: 'healthy',
      database: {
        connected: true,
        responseTime: `${responseTime}ms`,
        userCount,
        timestamp: new Date().toISOString()
      }
    }, { status: 200 })
    
  } catch (error: any) {
    console.error('Database health check failed:', error)
    
    let errorType = 'unknown'
    let suggestion = 'Check database configuration'
    
    if (error.code === 'P2010' || error.message.includes('Server selection timeout')) {
      errorType = 'connection_failed'
      suggestion = 'Ensure MongoDB is running on localhost:27017 or update DATABASE_URL for MongoDB Atlas'
    } else if (error.message === 'Health check timeout') {
      errorType = 'timeout'
      suggestion = 'Database is responding slowly. Check network connection or database performance'
    } else if (error.code === 'P2021') {
      errorType = 'schema_missing'
      suggestion = 'Run: npx prisma db push to create database schema'
    }
    
    return NextResponse.json({
      status: 'unhealthy',
      database: {
        connected: false,
        error: error.message,
        errorType,
        suggestion,
        timestamp: new Date().toISOString()
      }
    }, { status: 503 })
  } finally {
    await prisma.$disconnect()
  }
}