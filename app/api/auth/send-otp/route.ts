import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { generateOTP, sendOTPEmail } from '@/lib/email'
import { z } from 'zod'

const sendOTPSchema = z.object({
  email: z.string().email(),
  purpose: z.enum(['EMAIL_VERIFICATION', 'PASSWORD_RESET']).default('EMAIL_VERIFICATION'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, purpose } = sendOTPSchema.parse(body)

    // For email verification, check if user already exists
    if (purpose === 'EMAIL_VERIFICATION') {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        return NextResponse.json(
          { error: 'User already exists with this email' },
          { status: 400 }
        )
      }
    }

    // Generate OTP
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 minutes from now

    // Delete any existing OTPs for this email and purpose
    await prisma.emailOTP.deleteMany({
      where: {
        email,
        purpose,
      },
    })

    // Create new OTP record
    await prisma.emailOTP.create({
      data: {
        email,
        otp,
        purpose,
        expiresAt,
      },
    })

    // Send OTP email
    await sendOTPEmail(email, otp, purpose)

    return NextResponse.json(
      { 
        message: 'OTP sent successfully',
        email,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Send OTP error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to send OTP' },
      { status: 500 }
    )
  }
}