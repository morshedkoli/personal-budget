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
        isPaid: true,
        paidDate: new Date(),
      },
    })

    return NextResponse.json(payable)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}