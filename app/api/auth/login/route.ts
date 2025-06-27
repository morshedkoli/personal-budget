import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { comparePassword, generateToken } from '@/lib/auth'
import { z } from 'zod'

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate input
    const validatedData = loginSchema.parse(body)
    const { email, password } = validatedData

    // Find user with improved error handling and shorter timeout
    let user
    try {
      user = await prisma.user.findUnique({
        where: { email },
        select: {
          id: true,
          email: true,
          password: true,
          name: true,
          role: true,
          emailVerified: true
        }
      })
    } catch (dbError: any) {
      console.error('Database error during login:', dbError)
      
      // Handle specific database errors
      if (dbError.message === 'Database query timeout') {
        return NextResponse.json(
          { 
            error: 'Database connection timeout. Please try again.',
            details: 'The database is taking too long to respond. Check your database connection.'
          }, 
          { status: 503 }
        )
      }
      
      // Handle connection errors
      if (dbError.code === 'P2010' || dbError.message.includes('Server selection timeout')) {
        return NextResponse.json(
          { 
            error: 'Database connection failed. Please check if MongoDB is running.',
            details: 'Make sure MongoDB is installed and running on localhost:27017, or update DATABASE_URL to use MongoDB Atlas.'
          }, 
          { status: 503 }
        )
      }
      
      // Generic database error
      return NextResponse.json(
        { 
          error: 'Database error occurred',
          details: 'Please try again later or contact support if the issue persists.'
        }, 
        { status: 500 }
      )
    }

    if (!user) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Verify password
    const isValidPassword = await comparePassword(password, user.password)
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid credentials' },
        { status: 401 }
      )
    }

    // Generate JWT token
    const token = generateToken({
      userId: user.id,
      email: user.email,
      role: user.role,
    })

    // Return user data without password
    const { password: _, ...userWithoutPassword } = user

    return NextResponse.json({ token, user: userWithoutPassword })
  } catch (error) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}