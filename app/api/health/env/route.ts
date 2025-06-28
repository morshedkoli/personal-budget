import { NextRequest, NextResponse } from 'next/server'
import { getEnvironmentStatus } from '@/lib/env-validation'

export async function GET(request: NextRequest) {
  try {
    const status = getEnvironmentStatus();
    
    if (!status.isValid) {
      return NextResponse.json({
        status: 'invalid',
        error: status.error,
        timestamp: new Date().toISOString(),
        suggestions: [
          'Check your .env file exists in the project root',
          'Verify all required environment variables are set',
          'Refer to .env.example for the correct format'
        ]
      }, { status: 500 });
    }
    
    // Determine overall health
    const isHealthy = status.isValid && (
      status.email.hasGmail || 
      status.email.hasSendGrid || 
      status.email.hasCustomSMTP || 
      status.email.hasEthereal
    );
    
    return NextResponse.json({
      status: isHealthy ? 'healthy' : 'warning',
      environment: status.environment,
      database: {
        type: status.database.type,
        isLocal: status.database.isLocal,
        suggestions: status.database.suggestions
      },
      email: {
        configured: {
          gmail: status.email.hasGmail,
          sendgrid: status.email.hasSendGrid,
          customSMTP: status.email.hasCustomSMTP,
          ethereal: status.email.hasEthereal
        },
        hasAnyMethod: status.email.hasGmail || status.email.hasSendGrid || 
                     status.email.hasCustomSMTP || status.email.hasEthereal
      },
      recommendations: getRecommendations(status),
      timestamp: new Date().toISOString()
    }, { 
      status: isHealthy ? 200 : 206 // 206 = Partial Content (warnings)
    });
    
  } catch (error) {
    console.error('Environment health check failed:', error);
    
    return NextResponse.json({
      status: 'error',
      error: 'Failed to check environment configuration',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

function getRecommendations(status: any): string[] {
  const recommendations: string[] = [];
  
  // Database recommendations
  if (status.database.type === 'mongodb' && status.database.isLocal) {
    recommendations.push('Ensure MongoDB service is running locally');
    recommendations.push('Consider using MongoDB Atlas for production');
  }
  
  if (status.database.type === 'sqlite') {
    recommendations.push('SQLite is great for development');
    recommendations.push('Consider MongoDB for production deployment');
  }
  
  // Email recommendations
  if (!status.email.hasAnyMethod) {
    recommendations.push('Configure at least one email method for password reset functionality');
  }
  
  if (status.email.hasEthereal) {
    recommendations.push('Ethereal Email is configured - great for development testing');
  }
  
  if (status.environment === 'development') {
    recommendations.push('Development mode detected - some features may behave differently');
  }
  
  if (status.database.suggestions?.length > 0) {
    recommendations.push(...status.database.suggestions);
  }
  
  return recommendations;
}

export async function POST(request: NextRequest) {
  return NextResponse.json({
    message: 'Use GET method to check environment status'
  }, { status: 405 });
}