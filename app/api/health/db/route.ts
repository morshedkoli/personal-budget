import { NextRequest, NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    // Test database connection
    await prisma.$connect();
    
    // Try a simple query
    const userCount = await prisma.user.count();
    
    await prisma.$disconnect();
    
    return NextResponse.json({
      status: 'healthy',
      database: 'connected',
      userCount,
      timestamp: new Date().toISOString(),
      message: 'Database connection successful'
    }, { status: 200 });
    
  } catch (error: any) {
    console.error('Database health check failed:', error);
    
    // Determine error type for better debugging
    let errorType = 'unknown';
    let suggestion = 'Check database configuration';
    
    if (error.code === 'P1001') {
      errorType = 'connection_refused';
      suggestion = 'MongoDB server is not running. Install MongoDB or use MongoDB Atlas.';
    } else if (error.code === 'P1008') {
      errorType = 'timeout';
      suggestion = 'Database connection timeout. Check network or database server status.';
    } else if (error.code === 'P1009') {
      errorType = 'database_not_exist';
      suggestion = 'Database does not exist. Run: npm run db:push';
    } else if (error.code === 'P1010') {
      errorType = 'access_denied';
      suggestion = 'Access denied. Check database credentials in .env file.';
    }
    
    return NextResponse.json({
      status: 'unhealthy',
      database: 'disconnected',
      error: {
        type: errorType,
        code: error.code || 'UNKNOWN',
        message: error.message,
        suggestion
      },
      timestamp: new Date().toISOString()
    }, { status: 503 });
  }
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    message: 'Use GET method to check database health'
  }, { status: 405 });
}