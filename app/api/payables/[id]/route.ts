import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'
import { z } from 'zod'

const updatePayableSchema = z.object({
  description: z.string().min(1, 'Description is required').optional(),
  amount: z.number().min(0, 'Amount must be positive').optional(),
  dueDate: z.string().optional(),
  notes: z.string().optional(),
})

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const validatedData = updatePayableSchema.parse(body)

    // Check if payable exists and belongs to user
    const existingPayable = await prisma.payable.findFirst({
      where: {
        id: id,
        userId: user.userId,
      },
    })

    if (!existingPayable) {
      return NextResponse.json(
        { error: 'Payable not found' },
        { status: 404 }
      )
    }

    const payable = await prisma.payable.update({
      where: {
        id: id,
      },
      data: {
        ...validatedData,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
      },
    })

    return NextResponse.json(payable)
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
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id } = await params
    // Check if payable exists and belongs to user
    const existingPayable = await prisma.payable.findFirst({
      where: {
        id: id,
        userId: user.userId,
      },
    })

    if (!existingPayable) {
      return NextResponse.json(
        { error: 'Payable not found' },
        { status: 404 }
      )
    }

    await prisma.payable.delete({
      where: {
        id: id,
      },
    })

    return NextResponse.json({ message: 'Payable deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}