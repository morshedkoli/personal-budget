import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { z } from 'zod'

const verifyOTPSchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6),
  purpose: z.enum(['EMAIL_VERIFICATION', 'PASSWORD_RESET']).default('EMAIL_VERIFICATION'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, otp, purpose } = verifyOTPSchema.parse(body)

    // Find the OTP record
    const otpRecord = await prisma.emailOTP.findFirst({
      where: {
        email,
        otp,
        purpose,
        verified: false,
        expiresAt: {
          gt: new Date(), // Not expired
        },
      },
    })

    if (!otpRecord) {
      return NextResponse.json(
        { error: 'Invalid or expired OTP' },
        { status: 400 }
      )
    }

    // Mark OTP as verified
    await prisma.emailOTP.update({
      where: {
        id: otpRecord.id,
      },
      data: {
        verified: true,
      },
    })

    // Clean up expired OTPs for this email
    await prisma.emailOTP.deleteMany({
      where: {
        email,
        purpose,
        OR: [
          { verified: true },
          { expiresAt: { lt: new Date() } },
        ],
      },
    })

    return NextResponse.json(
      { 
        message: 'OTP verified successfully',
        email,
        verified: true,
      },
      { status: 200 }
    )
  } catch (error) {
    console.error('Verify OTP error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to verify OTP' },
      { status: 500 }
    )
  }
}