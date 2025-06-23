import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = user.userId
    const now = new Date()
    const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1)
    const currentMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)

    // Get total income and expenses
    const [incomeResult, expenseResult] = await Promise.all([
      prisma.transaction.aggregate({
        where: {
          userId,
          type: 'INCOME',
        },
        _sum: {
          amount: true,
        },
      }),
      prisma.transaction.aggregate({
        where: {
          userId,
          type: 'EXPENSE',
        },
        _sum: {
          amount: true,
        },
      }),
    ])

    const totalIncome = incomeResult._sum.amount || 0
    const totalExpenses = expenseResult._sum.amount || 0

    // Get assets and liabilities
    const [assetsResult, liabilitiesResult] = await Promise.all([
      prisma.asset.aggregate({
        where: {
          userId,
        },
        _sum: {
          balance: true,
        },
      }),
      prisma.liability.aggregate({
        where: {
          userId,
        },
        _sum: {
          balance: true,
        },
      }),
    ])

    const totalAssets = assetsResult._sum.balance || 0
    const totalLiabilities = liabilitiesResult._sum.balance || 0
    const netWorth = totalAssets - totalLiabilities

    // Get recent transactions
    const recentTransactions = await prisma.transaction.findMany({
      where: {
        userId,
      },
      include: {
        category: true,
      },
      orderBy: {
        date: 'desc',
      },
      take: 10,
    })

    // Get monthly data for the last 6 months
    const monthlyData = []
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1)
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0)
      
      const [monthIncome, monthExpenses] = await Promise.all([
        prisma.transaction.aggregate({
          where: {
            userId,
            type: 'INCOME',
            date: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
          _sum: {
            amount: true,
          },
        }),
        prisma.transaction.aggregate({
          where: {
            userId,
            type: 'EXPENSE',
            date: {
              gte: monthStart,
              lte: monthEnd,
            },
          },
          _sum: {
            amount: true,
          },
        }),
      ])

      monthlyData.push({
        month: monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        income: monthIncome._sum.amount || 0,
        expenses: monthExpenses._sum.amount || 0,
      })
    }

    // Get category data for current month expenses
    const categoryExpenses = await prisma.transaction.groupBy({
      by: ['categoryId'],
      where: {
        userId,
        type: 'EXPENSE',
        date: {
          gte: currentMonthStart,
        },
      },
      _sum: {
        amount: true,
      },
    })

    const categoryData = await Promise.all(
      categoryExpenses.map(async (item) => {
        const category = await prisma.category.findUnique({
          where: { id: item.categoryId },
        })
        return {
          name: category?.name || 'Unknown',
          amount: item._sum.amount || 0,
          color: category?.color || '#6b7280',
        }
      })
    )

    return NextResponse.json({
      totalIncome,
      totalExpenses,
      netWorth,
      totalAssets,
      totalLiabilities,
      recentTransactions,
      monthlyData,
      categoryData,
    })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}