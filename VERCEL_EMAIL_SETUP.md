# Vercel Email Configuration Guide

## Issue: OTP Emails Not Sending in Vercel Deployment

This guide addresses common issues with email functionality when deploying to Vercel.

## Root Causes & Solutions

### 1. Environment Variables Not Set in Vercel

**Problem**: Environment variables from `.env` file are not automatically available in Vercel deployment.

**Solution**: Add all email-related environment variables in Vercel dashboard:

1. Go to your Vercel project dashboard
2. Navigate to Settings → Environment Variables
3. Add the following variables:

```
EMAIL_SERVICE=gmail
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=kalikacchaudc@gmail.com
SMTP_PASSWORD=lbor yyhm comf gcef
EMAIL_USER=kalikacchaudc@gmail.com
EMAIL_PASSWORD=lbor yyhm comf gcef
EMAIL_FROM=kalikacchaudc@gmail.com
NODE_ENV=production
```

### 2. Gmail Security Settings

**Problem**: Gmail may block emails from Vercel's servers due to security policies.

**Solutions**:

A. **Use App-Specific Password** (Recommended):
   - Enable 2-Factor Authentication on Gmail
   - Generate an App-Specific Password
   - Use this password instead of your regular Gmail password

B. **Alternative Email Services**:
   - Consider using SendGrid, Mailgun, or AWS SES for production
   - These services are more reliable for transactional emails

### 3. Vercel Function Timeout

**Problem**: Email sending might timeout in Vercel serverless functions.

**Solution**: Add timeout configuration to `vercel.json`:

```json
{
  "functions": {
    "app/api/**/*.ts": {
      "maxDuration": 30
    }
  }
}
```

### 4. SMTP Connection Issues

**Problem**: Vercel's serverless environment may have network restrictions.

**Solution**: Use alternative email service configuration:

#### Option A: SendGrid (Recommended for Production)

1. Sign up for SendGrid account
2. Get API key
3. Update environment variables:

```
EMAIL_SERVICE=sendgrid
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=noreply@yourdomain.com
```

#### Option B: AWS SES

1. Set up AWS SES
2. Get credentials
3. Update environment variables:

```
EMAIL_SERVICE=ses
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
EMAIL_FROM=noreply@yourdomain.com
```

## Quick Fix Steps

### Step 1: Verify Environment Variables in Vercel

1. Go to Vercel Dashboard → Your Project → Settings → Environment Variables
2. Ensure all email variables are set for Production environment
3. Redeploy your application

### Step 2: Test Email Configuration

Add this test endpoint to verify email configuration:

**File: `app/api/test-email/route.ts`**

```typescript
import { NextRequest, NextResponse } from 'next/server'
import { sendOTPEmail } from '@/lib/email'

export async function POST(request: NextRequest) {
  try {
    const { email } = await request.json()
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }
    
    // Test OTP email
    const result = await sendOTPEmail(email, '123456', 'EMAIL_VERIFICATION')
    
    return NextResponse.json({ 
      success: true, 
      messageId: result.messageId,
      message: 'Test email sent successfully'
    })
  } catch (error) {
    console.error('Test email error:', error)
    return NextResponse.json({ 
      error: 'Failed to send test email',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
```

### Step 3: Enhanced Error Handling

Update the email configuration to handle Vercel-specific issues:

**Enhanced `createTransport` function:**

```typescript
const createTransport = async () => {
  try {
    // Log environment for debugging
    console.log('Email configuration:', {
      NODE_ENV: process.env.NODE_ENV,
      EMAIL_SERVICE: process.env.EMAIL_SERVICE,
      EMAIL_USER: process.env.EMAIL_USER,
      EMAIL_FROM: process.env.EMAIL_FROM,
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT
    })
    
    if (process.env.EMAIL_SERVICE === 'gmail') {
      return nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
        // Add these options for better reliability
        pool: true,
        maxConnections: 1,
        rateDelta: 20000,
        rateLimit: 5,
      })
    }
    
    // Fallback to SMTP configuration
    return nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      pool: true,
      maxConnections: 1,
    })
  } catch (error) {
    console.error('Failed to create email transporter:', error)
    throw new Error(`Email configuration failed: ${error.message}`)
  }
}
```

## Debugging Steps

1. **Check Vercel Function Logs**:
   - Go to Vercel Dashboard → Your Project → Functions
   - Check the logs for email-related errors

2. **Test Email Endpoint**:
   - Deploy the test endpoint above
   - Call it to verify email configuration

3. **Verify Environment Variables**:
   - Ensure all variables are set in Vercel (not just locally)
   - Check for typos in variable names

4. **Monitor Email Delivery**:
   - Check spam folders
   - Verify recipient email addresses
   - Monitor Gmail's sent folder

## Alternative Solutions

If Gmail continues to have issues, consider these production-ready alternatives:

1. **Resend** (Modern, developer-friendly)
2. **SendGrid** (Reliable, widely used)
3. **Mailgun** (Good for high volume)
4. **AWS SES** (Cost-effective for AWS users)
5. **Postmark** (Great deliverability)

These services are specifically designed for transactional emails and work better with serverless deployments like Vercel.