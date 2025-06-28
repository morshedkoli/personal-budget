import { NextRequest, NextResponse } from 'next/server'
import { getUserFromRequest } from '../../../../lib/auth'
import { prisma } from '../../../../lib/prisma'
import { z } from 'zod'

const updateAssetSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  type: z.enum(['CASH', 'BANK_ACCOUNT', 'INVESTMENT', 'REAL_ESTATE', 'VEHICLE', 'OTHER']).optional(),
  balance: z.number().min(0, 'Balance must be positive').optional(),
  initialAmount: z.number().min(0, 'Initial amount must be positive').optional(),
  description: z.string().optional(),
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
    const validatedData = updateAssetSchema.parse(body)

    // Check if asset exists and belongs to user
    const existingAsset = await prisma.asset.findFirst({
      where: {
        id: id,
        userId: user.userId,
      },
    })

    if (!existingAsset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      )
    }

    const asset = await prisma.asset.update({
      where: {
        id: id,
      },
      data: validatedData,
    })

    return NextResponse.json(asset)
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
    // Check if asset exists and belongs to user
    const existingAsset = await prisma.asset.findFirst({
      where: {
        id: id,
        userId: user.userId,
      },
    })

    if (!existingAsset) {
      return NextResponse.json(
        { error: 'Asset not found' },
        { status: 404 }
      )
    }

    await prisma.asset.delete({
      where: {
        id: id,
      },
    })

    return NextResponse.json({ message: 'Asset deleted successfully' })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}