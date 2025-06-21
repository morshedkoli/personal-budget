import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function DELETE(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Delete user and all related data (cascade delete)
    // The order matters due to foreign key constraints
    await prisma.$transaction(async (tx) => {
      // Delete user settings
      await tx.userSettings.deleteMany({
        where: { userId: user.userId },
      })

      // Delete transactions
      await tx.transaction.deleteMany({
        where: { userId: user.userId },
      })

      // Delete receivables
      await tx.receivable.deleteMany({
        where: { userId: user.userId },
      })

      // Delete payables
      await tx.payable.deleteMany({
        where: { userId: user.userId },
      })

      // Delete assets
      await tx.asset.deleteMany({
        where: { userId: user.userId },
      })

      // Delete liabilities
      await tx.liability.deleteMany({
        where: { userId: user.userId },
      })

      // Delete categories
      await tx.category.deleteMany({
        where: { userId: user.userId },
      })

      // Finally, delete the user
      await tx.user.delete({
        where: { id: user.userId },
      })
    })

    return NextResponse.json({
      message: 'Account deleted successfully',
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}