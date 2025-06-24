import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  name: z.string().min(1),
  otpVerified: z.boolean().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name, otpVerified } = registerSchema.parse(body)

    // Check if email has been verified via OTP
    const verifiedOTP = await prisma.emailOTP.findFirst({
      where: {
        email,
        purpose: 'EMAIL_VERIFICATION',
        verified: true,
        expiresAt: {
          gt: new Date(Date.now() - 30 * 60 * 1000), // Valid for 30 minutes after verification
        },
      },
    })

    if (!verifiedOTP) {
      return NextResponse.json(
        { error: 'Email verification required. Please verify your email with OTP first.' },
        { status: 400 }
      )
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user with verified email
    const user = await prisma.user.create({
      data: {
        email,
        password: hashedPassword,
        name,
        emailVerified: true,
      },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        emailVerified: true,
      },
    })

    // Clean up OTP records for this email
    await prisma.emailOTP.deleteMany({
      where: {
        email,
        purpose: 'EMAIL_VERIFICATION',
      },
    })

    // Create default categories for the user
    await prisma.category.createMany({
      data: [
        // Income categories
        { name: 'Salary', type: 'INCOME', color: '#22c55e', icon: '💰', userId: user.id },
        { name: 'Freelance', type: 'INCOME', color: '#3b82f6', icon: '💼', userId: user.id },
        { name: 'Investment', type: 'INCOME', color: '#8b5cf6', icon: '📈', userId: user.id },
        { name: 'Other Income', type: 'INCOME', color: '#06b6d4', icon: '💵', userId: user.id },
        
        // Expense categories
        { name: 'Food & Dining', type: 'EXPENSE', color: '#ef4444', icon: '🍽️', userId: user.id },
        { name: 'Transportation', type: 'EXPENSE', color: '#f97316', icon: '🚗', userId: user.id },
        { name: 'Shopping', type: 'EXPENSE', color: '#ec4899', icon: '🛍️', userId: user.id },
        { name: 'Entertainment', type: 'EXPENSE', color: '#8b5cf6', icon: '🎬', userId: user.id },
        { name: 'Bills & Utilities', type: 'EXPENSE', color: '#6b7280', icon: '⚡', userId: user.id },
        { name: 'Healthcare', type: 'EXPENSE', color: '#dc2626', icon: '🏥', userId: user.id },
        { name: 'Education', type: 'EXPENSE', color: '#2563eb', icon: '📚', userId: user.id },
        { name: 'Other Expenses', type: 'EXPENSE', color: '#64748b', icon: '💸', userId: user.id },
      ],
    })

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    return NextResponse.json({ token, user })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}