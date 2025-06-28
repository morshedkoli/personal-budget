import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '../../../../../lib/auth'
import { prisma } from '../../../../../lib/prisma'

export async function PATCH(
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

    const receivable = await prisma.receivable.update({
      where: {
        id: id,
      },
      data: {
        isPaid: true,
        paidDate: new Date(),
      },
    })

    return NextResponse.json(receivable)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}