import { NextRequest, NextResponse } from 'next/server'
import { sendOTPEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    console.log('=== EMAIL TEST ENDPOINT CALLED ===')
    
    // Log environment variables for debugging
    console.log('Environment check:', {
      NODE_ENV: process.env.NODE_ENV,
      EMAIL_SERVICE: process.env.EMAIL_SERVICE,
      EMAIL_USER: process.env.EMAIL_USER ? 'SET' : 'NOT SET',
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'SET' : 'NOT SET',
      EMAIL_FROM: process.env.EMAIL_FROM,
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT
    })
    
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    
    console.log('Attempting to send test OTP email to:', email)
    
    // Test OTP email
    const result = await sendOTPEmail(email, '123456', 'EMAIL_VERIFICATION')
    
    console.log('Email sent successfully:', result)
    
    return NextResponse.json({ 
      success: true, 
      messageId: result.messageId,
      message: 'Test email sent successfully',
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Test email error:', error)
    
    // Detailed error logging
    const errorDetails = {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      name: error instanceof Error ? error.name : undefined,
      code: (error as any)?.code,
      response: (error as any)?.response,
      responseCode: (error as any)?.responseCode
    }
    
    console.error('Detailed error:', errorDetails)
    
    return NextResponse.json({ 
      error: 'Failed to send test email',
      details: errorDetails,
      environment: process.env.NODE_ENV,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Email test endpoint is active',
    environment: process.env.NODE_ENV,
    emailService: process.env.EMAIL_SERVICE,
    emailConfigured: {
      EMAIL_USER: !!process.env.EMAIL_USER,
      EMAIL_PASSWORD: !!process.env.EMAIL_PASSWORD,
      EMAIL_FROM: !!process.env.EMAIL_FROM,
      SMTP_HOST: !!process.env.SMTP_HOST,
      SMTP_PORT: !!process.env.SMTP_PORT
    },
    timestamp: new Date().toISOString()
  })
}