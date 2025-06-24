import nodemailer from 'nodemailer'

// Generate 6-digit OTP
export const generateOTP = (): string => {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Email configuration
const createTransport = async () => {
  try {
    // Log environment for debugging in production
    console.log('Email configuration check:', {
      NODE_ENV: process.env.NODE_ENV,
      EMAIL_SERVICE: process.env.EMAIL_SERVICE,
      EMAIL_USER: process.env.EMAIL_USER ? 'SET' : 'NOT SET',
      EMAIL_PASSWORD: process.env.EMAIL_PASSWORD ? 'SET' : 'NOT SET',
      EMAIL_FROM: process.env.EMAIL_FROM,
      SMTP_HOST: process.env.SMTP_HOST,
      SMTP_PORT: process.env.SMTP_PORT
    })
    
    // For development, use Ethereal Email (fake SMTP service)
    // For production, configure with your email service (Gmail, SendGrid, etc.)
    
    if (process.env.NODE_ENV === 'development' && !process.env.EMAIL_SERVICE) {
      // Development: Use Ethereal Email for testing
      try {
        const testAccount = await nodemailer.createTestAccount()
        return nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false,
          auth: {
            user: testAccount.user,
            pass: testAccount.pass,
          },
        })
      } catch (error) {
        console.warn('Failed to create Ethereal test account, falling back to console logging')
        return null
      }
    }
    
    // Production: Configure with your email service
    // Example for Gmail:
    if (process.env.EMAIL_SERVICE === 'gmail') {
      if (!process.env.EMAIL_USER || !process.env.EMAIL_PASSWORD) {
        throw new Error('Gmail configuration incomplete: EMAIL_USER and EMAIL_PASSWORD are required')
      }
      
      return nodemailer.createTransport({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD, // Use App Password for Gmail
        },
        // Enhanced configuration for Vercel deployment
        pool: true,
        maxConnections: 1,
        rateDelta: 20000,
        rateLimit: 5,
        // Add timeout settings
        connectionTimeout: 60000,
        greetingTimeout: 30000,
        socketTimeout: 60000,
      })
    }
  
  // Example for SendGrid:
  if (process.env.EMAIL_SERVICE === 'sendgrid') {
    return nodemailer.createTransport({
      host: 'smtp.sendgrid.net',
      port: 587,
      auth: {
        user: 'apikey',
        pass: process.env.SENDGRID_API_KEY,
      },
    })
  }
  
    // Example for custom SMTP (fallback):
    if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.SMTP_PASSWORD) {
      throw new Error('SMTP configuration incomplete: SMTP_HOST, SMTP_USER, and SMTP_PASSWORD are required')
    }
    
    return nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
      // Enhanced configuration for Vercel deployment
      pool: true,
      maxConnections: 1,
      connectionTimeout: 60000,
      greetingTimeout: 30000,
      socketTimeout: 60000,
    })
  } catch (error) {
    console.error('Failed to create email transporter:', error)
    throw new Error(`Email configuration failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export const sendPasswordResetEmail = async (email: string, resetUrl: string, userName?: string) => {
  try {
    const transporter = await createTransport()
    
    // If no transporter (development fallback), just log to console
    if (!transporter) {
      console.log('\n=== PASSWORD RESET EMAIL (Development Mode) ===')
      console.log('To:', email)
      console.log('Subject: Reset Your Password - Budgeting App')
      console.log('Reset URL:', resetUrl)
      console.log('User:', userName || 'Unknown')
      console.log('===============================================\n')
      return {
        success: true,
        messageId: 'dev-mode-' + Date.now(),
        previewUrl: resetUrl
      }
    }
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@budgetingapp.com',
      to: email,
      subject: 'Reset Your Password - Budgeting App',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Reset Your Password</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 10px;
              padding: 40px;
              text-align: center;
              color: white;
            }
            .logo {
              width: 60px;
              height: 60px;
              background: rgba(255, 255, 255, 0.2);
              border-radius: 50%;
              margin: 0 auto 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
            }
            .button {
              display: inline-block;
              background: #fff;
              color: #667eea;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              margin: 20px 0;
              transition: transform 0.2s;
            }
            .button:hover {
              transform: translateY(-2px);
            }
            .footer {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin-top: 20px;
              color: #666;
              font-size: 14px;
            }
            .warning {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              color: #856404;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">🔐</div>
            <h1>Reset Your Password</h1>
            <p>Hello${userName ? ` ${userName}` : ''},</p>
            <p>We received a request to reset your password for your Budgeting App account.</p>
            <p>Click the button below to reset your password:</p>
            <a href="${resetUrl}" class="button">Reset Password</a>
            <p>This link will expire in 1 hour for security reasons.</p>
          </div>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong>
            <ul style="text-align: left; margin: 10px 0;">
              <li>If you didn't request this password reset, please ignore this email</li>
              <li>Never share this link with anyone</li>
              <li>This link will expire in 1 hour</li>
            </ul>
          </div>
          
          <div class="footer">
            <p><strong>Alternative Link:</strong></p>
            <p>If the button doesn't work, copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 4px;">
              ${resetUrl}
            </p>
            <hr style="margin: 20px 0; border: none; border-top: 1px solid #dee2e6;">
            <p>This email was sent from Budgeting App. If you have any questions, please contact our support team.</p>
            <p style="font-size: 12px; color: #999;">© 2024 Budgeting App. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      text: `
        Reset Your Password - Budgeting App
        
        Hello${userName ? ` ${userName}` : ''},
        
        We received a request to reset your password for your Budgeting App account.
        
        Please click the following link to reset your password:
        ${resetUrl}
        
        This link will expire in 1 hour for security reasons.
        
        If you didn't request this password reset, please ignore this email.
        
        Security Notice:
        - Never share this link with anyone
        - This link will expire in 1 hour
        - If you didn't request this, please ignore this email
        
        © 2024 Budgeting App. All rights reserved.
      `
    }
    
    const info = await transporter.sendMail(mailOptions)
    
    console.log('Password reset email sent successfully:')
    console.log('Message ID:', info.messageId)
    
    // For development with Ethereal, log the preview URL
    if (process.env.NODE_ENV === 'development') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info as any))
    }
    
    return {
      success: true,
      messageId: info.messageId,
      previewUrl: process.env.NODE_ENV === 'development' ? nodemailer.getTestMessageUrl(info as any) : undefined
    }
  } catch (error) {
    console.error('Error sending password reset email:', error)
    throw new Error('Failed to send password reset email')
  }
}

export const sendWelcomeEmail = async (email: string, userName: string) => {
  try {
    const transporter = await createTransport()
    
    // If no transporter (development fallback), just log to console
    if (!transporter) {
      console.log('\n=== WELCOME EMAIL (Development Mode) ===')
      console.log('To:', email)
      console.log('Subject: Welcome to Budgeting App! 🎉')
      console.log('User:', userName)
      console.log('========================================\n')
      return {
        success: true,
        messageId: 'dev-mode-' + Date.now()
      }
    }
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@budgetingapp.com',
      to: email,
      subject: 'Welcome to Budgeting App! 🎉',
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Welcome to Budgeting App</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 10px;
              padding: 40px;
              text-align: center;
              color: white;
            }
            .logo {
              width: 60px;
              height: 60px;
              background: rgba(255, 255, 255, 0.2);
              border-radius: 50%;
              margin: 0 auto 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
            }
            .button {
              display: inline-block;
              background: #fff;
              color: #667eea;
              padding: 15px 30px;
              text-decoration: none;
              border-radius: 8px;
              font-weight: bold;
              margin: 20px 0;
            }
            .features {
              background: #f8f9fa;
              padding: 30px;
              border-radius: 8px;
              margin: 20px 0;
              color: #333;
            }
            .feature {
              margin: 15px 0;
              padding: 10px;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">💰</div>
            <h1>Welcome to Budgeting App!</h1>
            <p>Hello ${userName},</p>
            <p>Thank you for joining Budgeting App! We're excited to help you take control of your finances.</p>
            <a href="${process.env.NEXTAUTH_URL || 'https://personal-budget-ten-ecru.vercel.app'}/dashboard" class="button">Get Started</a>
          </div>
          
          <div class="features">
            <h2>🚀 What you can do with Budgeting App:</h2>
            <div class="feature">📊 <strong>Track Expenses:</strong> Monitor your spending across different categories</div>
            <div class="feature">💳 <strong>Manage Assets:</strong> Keep track of your bank accounts and investments</div>
            <div class="feature">📈 <strong>View Reports:</strong> Get insights into your financial habits</div>
            <div class="feature">🎯 <strong>Set Goals:</strong> Plan and achieve your financial objectives</div>
            <div class="feature">📱 <strong>Mobile Friendly:</strong> Access your budget anywhere, anytime</div>
          </div>
          
          <div style="text-align: center; padding: 20px; color: #666;">
            <p>Need help getting started? Check out our <a href="#" style="color: #667eea;">user guide</a> or contact our support team.</p>
            <p style="font-size: 12px; color: #999;">© 2024 Budgeting App. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      text: `
        Welcome to Budgeting App!
        
        Hello ${userName},
        
        Thank you for joining Budgeting App! We're excited to help you take control of your finances.
        
        Get started: ${process.env.NEXTAUTH_URL || 'https://personal-budget-ten-ecru.vercel.app'}/dashboard
        
        What you can do with Budgeting App:
        - Track Expenses: Monitor your spending across different categories
        - Manage Assets: Keep track of your bank accounts and investments
        - View Reports: Get insights into your financial habits
        - Set Goals: Plan and achieve your financial objectives
        - Mobile Friendly: Access your budget anywhere, anytime
        
        Need help getting started? Contact our support team.
        
        © 2024 Budgeting App. All rights reserved.
      `
    }
    
    const info = await transporter.sendMail(mailOptions)
    
    console.log('Welcome email sent successfully:')
    console.log('Message ID:', info.messageId)
    
    return {
      success: true,
      messageId: info.messageId
    }
  } catch (error) {
    console.error('Error sending welcome email:', error)
    // Don't throw error for welcome email, just log it
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export const sendOTPEmail = async (email: string, otp: string, purpose: 'EMAIL_VERIFICATION' | 'PASSWORD_RESET' = 'EMAIL_VERIFICATION') => {
  try {
    const transporter = await createTransport()
    
    // If no transporter (development fallback), just log to console
    if (!transporter) {
      console.log('\n=== OTP EMAIL (Development Mode) ===')
      console.log('To:', email)
      console.log('Subject:', purpose === 'EMAIL_VERIFICATION' ? 'Verify Your Email - Budgeting App' : 'Password Reset OTP - Budgeting App')
      console.log('OTP:', otp)
      console.log('Purpose:', purpose)
      console.log('======================================\n')
      return {
        success: true,
        messageId: 'dev-mode-' + Date.now()
      }
    }
    
    const isVerification = purpose === 'EMAIL_VERIFICATION'
    const subject = isVerification ? 'Verify Your Email - Budgeting App' : 'Password Reset OTP - Budgeting App'
    const title = isVerification ? 'Verify Your Email' : 'Reset Your Password'
    const message = isVerification 
      ? 'Please use the following 6-digit code to verify your email address:'
      : 'Please use the following 6-digit code to reset your password:'
    
    const mailOptions = {
      from: process.env.EMAIL_FROM || 'noreply@budgetingapp.com',
      to: email,
      subject,
      html: `
        <!DOCTYPE html>
        <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>${title}</title>
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 10px;
              padding: 40px;
              text-align: center;
              color: white;
            }
            .logo {
              width: 60px;
              height: 60px;
              background: rgba(255, 255, 255, 0.2);
              border-radius: 50%;
              margin: 0 auto 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              font-size: 24px;
            }
            .otp-code {
              background: #fff;
              color: #667eea;
              padding: 20px;
              border-radius: 8px;
              font-size: 32px;
              font-weight: bold;
              letter-spacing: 8px;
              margin: 20px 0;
              font-family: 'Courier New', monospace;
            }
            .footer {
              background: #f8f9fa;
              padding: 20px;
              border-radius: 8px;
              margin-top: 20px;
              color: #666;
              font-size: 14px;
            }
            .warning {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              color: #856404;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="logo">${isVerification ? '📧' : '🔐'}</div>
            <h1>${title}</h1>
            <p>${message}</p>
            <div class="otp-code">${otp}</div>
            <p>This code will expire in 10 minutes for security reasons.</p>
          </div>
          
          <div class="warning">
            <strong>⚠️ Security Notice:</strong>
            <ul style="text-align: left; margin: 10px 0;">
              <li>Never share this code with anyone</li>
              <li>This code will expire in 10 minutes</li>
              <li>If you didn't request this, please ignore this email</li>
            </ul>
          </div>
          
          <div class="footer">
            <p>This email was sent from Budgeting App. If you have any questions, please contact our support team.</p>
            <p style="font-size: 12px; color: #999;">© 2024 Budgeting App. All rights reserved.</p>
          </div>
        </body>
        </html>
      `,
      text: `
        ${title} - Budgeting App
        
        ${message}
        
        Your verification code: ${otp}
        
        This code will expire in 10 minutes for security reasons.
        
        Security Notice:
        - Never share this code with anyone
        - This code will expire in 10 minutes
        - If you didn't request this, please ignore this email
        
        © 2024 Budgeting App. All rights reserved.
      `
    }
    
    const info = await transporter.sendMail(mailOptions)
    
    console.log('OTP email sent successfully:')
    console.log('Message ID:', info.messageId)
    
    // For development with Ethereal, log the preview URL
    if (process.env.NODE_ENV === 'development') {
      console.log('Preview URL:', nodemailer.getTestMessageUrl(info as any))
    }
    
    return {
      success: true,
      messageId: info.messageId,
      previewUrl: process.env.NODE_ENV === 'development' ? nodemailer.getTestMessageUrl(info as any) : undefined
    }
  } catch (error) {
    console.error('Error sending OTP email:', error)
    throw new Error('Failed to send OTP email')
  }
}