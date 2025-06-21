import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromRequest } from '@/lib/auth'
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns'
import jsPDF from 'jspdf'
import autoTable from 'jspdf-autotable'

export async function GET(request: NextRequest) {
  try {
    const user = await getUserFromRequest(request)
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const exportFormat = searchParams.get('format') || 'csv'
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
        startDate = new Date(2000, 0, 1)
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
        date: 'desc',
      },
    })

    if (exportFormat === 'csv') {
      // Generate CSV
      const csvHeaders = [
        'Date',
        'Type',
        'Description',
        'Amount',
        'Category'
      ]

      const csvRows = transactions.map(transaction => [
        transaction.date.toISOString().split('T')[0],
        transaction.type,
        transaction.description,
        transaction.amount.toString(),
        transaction.category?.name || ''
      ])

      const csvContent = [
        csvHeaders.join(','),
        ...csvRows.map(row => row.map(field => `"${field}"`).join(','))
      ].join('\n')

      return new NextResponse(csvContent, {
        headers: {
          'Content-Type': 'text/csv',
          'Content-Disposition': `attachment; filename="financial-report-${period}.csv"`,
        },
      })
    } else if (exportFormat === 'pdf') {
      // Generate PDF using jsPDF
      const totalIncome = transactions
        .filter(t => t.type === 'INCOME')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const totalExpenses = transactions
        .filter(t => t.type === 'EXPENSE')
        .reduce((sum, t) => sum + t.amount, 0)
      
      const totalSavings = totalIncome - totalExpenses
      const savingsRate = totalIncome > 0 ? (totalSavings / totalIncome) * 100 : 0

      // Calculate expenses by category
      const expenseTransactions = transactions.filter(t => t.type === 'EXPENSE')
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

      // Create PDF
      const doc = new jsPDF()
      
      // Header
      doc.setFontSize(20)
      doc.text('Financial Report', 105, 20, { align: 'center' })
      
      doc.setFontSize(12)
      doc.text(`Period: ${period.toUpperCase()}`, 105, 30, { align: 'center' })
      doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 105, 37, { align: 'center' })
      doc.text(`User: ${user.email}`, 105, 44, { align: 'center' })
      
      // Summary section
      doc.setFontSize(16)
      doc.text('Financial Summary', 20, 60)
      
      doc.setFontSize(12)
      let yPos = 75
      doc.text(`Total Income: $${totalIncome.toLocaleString()}`, 20, yPos)
      yPos += 10
      doc.text(`Total Expenses: $${totalExpenses.toLocaleString()}`, 20, yPos)
      yPos += 10
      doc.text(`Net Savings: $${totalSavings.toLocaleString()}`, 20, yPos)
      yPos += 10
      doc.text(`Savings Rate: ${savingsRate.toFixed(1)}%`, 20, yPos)
      yPos += 20
      
      // Expenses by Category table
      if (expensesByCategory.length > 0) {
        doc.setFontSize(16)
        doc.text('Expenses by Category', 20, yPos)
        yPos += 10
        
        const categoryTableData = expensesByCategory.map(cat => [
          cat.category,
          `$${cat.amount.toLocaleString()}`,
          `${cat.percentage.toFixed(1)}%`
        ])
        
        autoTable(doc, {
          head: [['Category', 'Amount', 'Percentage']],
          body: categoryTableData,
          startY: yPos,
          theme: 'grid',
          headStyles: { fillColor: [66, 139, 202] },
          margin: { left: 20, right: 20 }
        })
        
        yPos = (doc as any).lastAutoTable.finalY + 20
      }
      
      // Add new page for transactions if needed
      if (yPos > 200) {
        doc.addPage()
        yPos = 20
      }
      
      // Transaction details table
      doc.setFontSize(16)
      doc.text('Recent Transactions', 20, yPos)
      yPos += 10
      
      const transactionTableData = transactions.slice(0, 30).map(transaction => [
        transaction.date.toLocaleDateString(),
        transaction.type,
        transaction.description && transaction.description.length > 30 ? transaction.description.substring(0, 30) + '...' : (transaction.description || 'N/A'),
        `$${transaction.amount.toLocaleString()}`,
        transaction.category?.name || 'N/A'
      ])
      
      autoTable(doc, {
        head: [['Date', 'Type', 'Description', 'Amount', 'Category']],
        body: transactionTableData,
        startY: yPos,
        theme: 'grid',
        headStyles: { fillColor: [66, 139, 202] },
        margin: { left: 20, right: 20 },
        columnStyles: {
          2: { cellWidth: 60 }, // Description column
          3: { halign: 'right' }  // Amount column
        }
      })
      
      if (transactions.length > 30) {
        const finalY = (doc as any).lastAutoTable.finalY + 10
        doc.setFontSize(10)
        doc.text(`... and ${transactions.length - 30} more transactions`, 20, finalY)
      }
      
      // Generate PDF buffer
      const pdfBuffer = Buffer.from(doc.output('arraybuffer'))
      
      return new NextResponse(pdfBuffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="financial-report-${period}.pdf"`,
        },
      })
    }

    return NextResponse.json({ error: 'Invalid format' }, { status: 400 })
  } catch (error) {
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}