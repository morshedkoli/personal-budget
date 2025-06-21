import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'
import { z } from 'zod'

const updateLiabilitySchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  type: z.enum(['CREDIT_CARD', 'LOAN', 'MORTGAGE', 'OTHER']).optional(),
  balance: z.number().min(0, 'Balance must be positive').optional(),
  initialAmount: z.number().min(0, 'Initial amount must be positive').optional(),
  interestRate: z.number().optional(),
  dueDate: z.string().optional(),
  description: z.string().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const validatedData = updateLiabilitySchema.parse(body)

    // Check if liability exists and belongs to user
    const existingLiability = await prisma.liability.findFirst({
      where: {
        id: params.id,
        userId: user.userId,
      },
    })

    if (!existingLiability) {
      return NextResponse.json(
        { error: 'Liability not found' },
        { status: 404 }
      )
    }

    const liability = await prisma.liability.update({
      where: {
        id: params.id,
      },
      data: {
        ...validatedData,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
      },
    })

    return NextResponse.json(liability)
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check if liability exists and belongs to user
    const existingLiability = await prisma.liability.findFirst({
      where: {
        id: params.id,
        userId: user.userId,
      },
    })

    if (!existingLiability) {
      return NextResponse.json(
        { error: 'Liability not found' },
        { status: 404 }
      )
    }

    await prisma.liability.delete({
      where: {
        id: params.id,
      },
    })

    return NextResponse.json({ message: 'Liability deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}