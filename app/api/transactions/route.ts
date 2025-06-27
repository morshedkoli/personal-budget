import { NextRequest, NextResponse } from 'next/server' // Add NextRequest, NextResponse
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'

const createTransactionSchema = z.object({
  amount: z.number().positive(),
  description: z.string().optional(),
  date: z.string().datetime(),
  type: z.enum(['INCOME', 'EXPENSE', 'TRANSFER']),
  categoryId: z.string(),
  fromAssetId: z.string().optional(),
  toAssetId: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || 'ALL'
    const categoryId = searchParams.get('category') || 'ALL'
    
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      userId: user.userId,
    }

    if (search) {
      where.OR = [
        {
          description: {
            contains: search,
            mode: 'insensitive',
          },
        },
        {
          category: {
            name: {
              contains: search,
              mode: 'insensitive',
            },
          },
        },
      ]
    }

    if (type !== 'ALL') {
      where.type = type
    }

    if (categoryId !== 'ALL') {
      where.categoryId = categoryId
    }

    // Get transactions with pagination
    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: {
          date: 'desc',
        },
        skip,
        take: limit,
      }),
      prisma.transaction.count({ where }),
    ])

    return NextResponse.json({
      transactions,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createTransactionSchema.parse(body)

    // Verify category belongs to user
    const category = await prisma.category.findFirst({
      where: {
        id: validatedData.categoryId,
        userId: user.userId,
      },
    })

    if (!category) {
      return NextResponse.json(
        { error: 'Category not found' },
        { status: 404 }
      )
    }

    // Create transaction
    const transaction = await prisma.transaction.create({
      data: {
        ...validatedData,
        userId: user.userId,
        date: new Date(validatedData.date),
      },
      include: {
        category: true,
      },
    })

    // Update asset balances for transfers
    if (validatedData.type === 'TRANSFER' && validatedData.fromAssetId && validatedData.toAssetId) {
      await Promise.all([
        prisma.asset.update({
          where: { id: validatedData.fromAssetId },
          data: {
            balance: {
              decrement: validatedData.amount,
            },
          },
        }),
        prisma.asset.update({
          where: { id: validatedData.toAssetId },
          data: {
            balance: {
              increment: validatedData.amount,
            },
          },
        }),
      ])
    }

    return NextResponse.json(transaction, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid data', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}