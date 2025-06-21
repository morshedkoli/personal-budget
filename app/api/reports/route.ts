import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const period = searchParams.get('period') || '6months'

    // Calculate date range based on period
    let startDate: Date
    let endDate = new Date()

    switch (period) {
      case '1month':
        startDate = subMonths(new Date(), 1)
        break
      case '3months':
        startDate = subMonths(new Date(), 3)
        break
      case '6months':
        startDate = subMonths(new Date(), 6)
        break
      case '12months':
        startDate = subMonths(new Date(), 12)
        break
      case 'ytd':
        startDate = new Date(new Date().getFullYear(), 0, 1)
        break
      case 'all':
        startDate = new Date(2000, 0, 1) // Far back date
        break
      default:
        startDate = subMonths(new Date(), 6)
    }

    // Get all transactions in the period
    const transactions = await prisma.transaction.findMany({
      where: {
        userId: user.userId,
        date: {
          gte: startDate,
          lte: endDate,
        },
      },
      include: {
        category: true,
      },
      orderBy: {
        date: 'asc',
      },
    })

    // Calculate monthly data
    const monthlyData = []
    const monthsToShow = period === 'all' ? 12 : period === '12months' ? 12 : period === '6months' ? 6 : 3
    
    for (let i = monthsToShow - 1; i >= 0; i--) {
      const monthDate = subMonths(new Date(), i)
      const monthStart = startOfMonth(monthDate)
      const monthEnd = endOfMonth(monthDate)
      
      const monthTransactions = transactions.filter(t => 
        t.date >= monthStart && t.date <= monthEnd
      )
      
      const income = monthTransactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const expenses = monthTransactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const savings = income - expenses
      
      monthlyData.push({
        month: format(monthDate, 'MMM yyyy'),
        income,
        expenses,
        savings,
      })
    }

    // Calculate expenses by category
    const expenseTransactions = transactions.filter(t => t.type === 'EXPENSE')
    const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0)
    
    const categoryMap = new Map()
    expenseTransactions.forEach(transaction => {
      const categoryName = transaction.category?.name || 'Uncategorized'
      const current = categoryMap.get(categoryName) || 0
      categoryMap.set(categoryName, current + transaction.amount)
    })
    
    const expensesByCategory = Array.from(categoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)

    // Calculate income by category
    const incomeTransactions = transactions.filter(t => t.type === 'INCOME')
    const totalIncome = incomeTransactions.reduce((sum, t) => sum + t.amount, 0)
    
    const incomeCategoryMap = new Map()
    incomeTransactions.forEach(transaction => {
      const categoryName = transaction.category?.name || 'Uncategorized'
      const current = incomeCategoryMap.get(categoryName) || 0
      incomeCategoryMap.set(categoryName, current + transaction.amount)
    })
    
    const incomeByCategory = Array.from(incomeCategoryMap.entries())
      .map(([category, amount]) => ({
        category,
        amount,
        percentage: totalIncome > 0 ? (amount / totalIncome) * 100 : 0,
      }))
      .sort((a, b) => b.amount - a.amount)

    // Calculate totals and averages
    const totalSavings = totalIncome - totalExpenses
    const averageMonthlyIncome = monthlyData.length > 0 ? totalIncome / monthlyData.length : 0
    const averageMonthlyExpenses = monthlyData.length > 0 ? totalExpenses / monthlyData.length : 0
    const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0

    const reportData = {
      monthlyData,
      expensesByCategory,
      incomeByCategory,
      totalIncome,
      totalExpenses,
      totalSavings,
      averageMonthlyIncome,
      averageMonthlyExpenses,
      savingsRate,
    }

    return NextResponse.json(reportData)
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}