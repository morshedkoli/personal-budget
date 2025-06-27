import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { hashPassword, generateToken } from '@/lib/auth'
import { z } from 'zod'

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6, 'Password must be at least 6 characters'),
  name: z.string().min(1, 'Name is required'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password, name } = registerSchema.parse(body)

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists with this email' },
        { status: 400 }
      )
    }

    // Hash password
    const hashedPassword = await hashPassword(password)

    // Create user
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