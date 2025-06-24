import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { sendOTPEmail } from '@/lib/email'
import { z } from 'zod'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = forgotPasswordSchema.parse(body)

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() }
    })
    
    // Always return success to prevent email enumeration
    // But only send email if user exists
    if (user) {
      // Delete any existing OTPs for this email and purpose
      await prisma.emailOTP.deleteMany({
        where: {
          email: email.toLowerCase(),
          purpose: 'PASSWORD_RESET'
        }
      })

      // Generate 6-digit OTP
      const otp = Math.floor(100000 + Math.random() * 900000).toString()
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes

      // Save OTP to database
      await prisma.emailOTP.create({
        data: {
          email: email.toLowerCase(),
          otp,
          purpose: 'PASSWORD_RESET',
          expiresAt,
          userId: user.id
        }
      })

      // Send OTP email
      try {
        await sendOTPEmail(email, otp, 'PASSWORD_RESET')
      } catch (emailError) {
        console.error('Failed to send OTP email:', emailError)
        // Continue execution for security reasons
      }
    }

    return NextResponse.json(
      { 
        message: 'If an account with that email exists, a verification code has been sent.',
        ...(process.env.NODE_ENV === 'development' && user ? { otp } : {})
      },
      { status: 200 }
    )
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: error.errors[0].message },
        { status: 400 }
      )
    }
    
    console.error('Forgot password error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}