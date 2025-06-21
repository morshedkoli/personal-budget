import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { z } from 'zod'

const createAssetSchema = z.object({
  name: z.string().min(1),
  type: z.enum(['CASH', 'BANK_ACCOUNT', 'INVESTMENT', 'REAL_ESTATE', 'VEHICLE', 'OTHER']),
  balance: z.number(),
  initialAmount: z.number(),
  description: z.string().optional(),
})

export async function GET(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const assets = await prisma.asset.findMany({
      where: {
        userId: user.userId,
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(assets)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = createAssetSchema.parse(body)

    const asset = await prisma.asset.create({
      data: {
        ...validatedData,
        userId: user.userId,
      },
    })

    return NextResponse.json(asset, { status: 201 })
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