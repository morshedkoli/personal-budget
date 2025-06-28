import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'
import { z } from 'zod'

const updateReceivableSchema = z.object({
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
    const validatedData = updateReceivableSchema.parse(body)

    // Check if receivable exists and belongs to user
    const existingReceivable = await prisma.receivable.findFirst({
      where: {
        id,
        userId: user.userId,
      },
    })

    if (!existingReceivable) {
      return NextResponse.json(
        { error: 'Receivable not found' },
        { status: 404 }
      )
    }

    const receivable = await prisma.receivable.update({
      where: {
        id,
      },
      data: {
        ...validatedData,
        dueDate: validatedData.dueDate ? new Date(validatedData.dueDate) : undefined,
      },
    })

    return NextResponse.json(receivable)
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
    // Check if receivable exists and belongs to user
    const existingReceivable = await prisma.receivable.findFirst({
      where: {
        id: id,
        userId: user.userId,
      },
    })

    if (!existingReceivable) {
      return NextResponse.json(
        { error: 'Receivable not found' },
        { status: 404 }
      )
    }

    await prisma.receivable.delete({
      where: {
        id: id,
      },
    })

    return NextResponse.json({ message: 'Receivable deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}