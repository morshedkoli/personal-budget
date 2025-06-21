'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../providers'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import { Button } from '../components/ui/Button'
import {
  ArrowUpIcon,
  ArrowDownIcon,
  BanknotesIcon,
  CreditCardIcon,
  ChartBarIcon,
  PlusIcon,
} from '@heroicons/react/24/outline'
import Link from 'next/link'
import { Line, Doughnut, Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ArcElement,
  BarElement
)

interface DashboardData {
  totalIncome: number
  totalExpenses: number
  netWorth: number
  totalAssets: number
  totalLiabilities: number
  recentTransactions: any[]
  monthlyData: any[]
  categoryData: any[]
}

export default function DashboardPage() {
  const { user } = useAuth()
  const [data, setData] = useState<DashboardData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/dashboard', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const dashboardData = await response.json()
        setData(dashboardData)
      } else {
        setError('Failed to fetch dashboard data')
      }
    } catch (error) {
      setError('An error occurred while fetching data')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button
          onClick={fetchDashboardData}
          className="mt-4 btn btn-primary"
        >
          Try Again
        </button>
      </div>
    )
  }

  const savings = (data?.totalIncome || 0) - (data?.totalExpenses || 0)
  const savingsRate = data?.totalIncome ? (savings / data.totalIncome) * 100 : 0

  // Chart configurations
  const lineChartData = {
    labels: data?.monthlyData?.map(item => item.month) || [],
    datasets: [
      {
        label: 'Income',
        data: data?.monthlyData?.map(item => item.income) || [],
        borderColor: 'rgb(34, 197, 94)',
        backgroundColor: 'rgba(34, 197, 94, 0.1)',
        tension: 0.1,
      },
      {
        label: 'Expenses',
        data: data?.monthlyData?.map(item => item.expenses) || [],
        borderColor: 'rgb(239, 68, 68)',
        backgroundColor: 'rgba(239, 68, 68, 0.1)',
        tension: 0.1,
      },
    ],
  }

  const doughnutChartData = {
    labels: data?.categoryData?.map(item => item.name) || [],
    datasets: [
      {
        data: data?.categoryData?.map(item => item.amount) || [],
        backgroundColor: data?.categoryData?.map(item => item.color) || [],
        borderWidth: 2,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top' as const,
      },
    },
  }

  return (
    <div className="touch-spacing">
      {/* Header */}
      <div className="mobile-flex gap-4">
        <h1 className="mobile-heading font-bold text-gray-900 dark:text-white">
          Dashboard Overview
        </h1>
        <Link href="/dashboard/transactions/new">
          <Button
            variant="default"
            size="lg"
            animation="bounce"
            icon={<PlusIcon className="h-4 w-4" />}
            iconPosition="left"
            className="w-full sm:w-auto"
          >
            Add Transaction
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="card p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-3 bg-green-100 dark:bg-green-900 rounded-xl shadow-sm">
              <ArrowUpIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4 min-w-0 flex-1">
              <p className="responsive-text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Income
              </p>
              <p className="responsive-text-xl font-bold text-gray-900 dark:text-white truncate">
                ${(data?.totalIncome || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-3 bg-red-100 dark:bg-red-900 rounded-xl shadow-sm">
              <ArrowDownIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4 min-w-0 flex-1">
              <p className="responsive-text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Expenses
              </p>
              <p className="responsive-text-xl font-bold text-gray-900 dark:text-white truncate">
                ${(data?.totalExpenses || 0).toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-xl shadow-sm">
              <BanknotesIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4 min-w-0 flex-1">
              <p className="responsive-text-sm font-medium text-gray-600 dark:text-gray-400">
                Savings
              </p>
              <p className="responsive-text-xl font-bold text-gray-900 dark:text-white truncate">
                ${savings.toLocaleString()}
              </p>
              <p className={`responsive-text-xs ${savings >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {savingsRate.toFixed(1)}% of income
              </p>
            </div>
          </div>
        </div>

        <div className="card p-4 sm:p-6">
          <div className="flex items-center">
            <div className="p-3 bg-purple-100 dark:bg-purple-900 rounded-xl shadow-sm">
              <ChartBarIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div className="ml-4 min-w-0 flex-1">
              <p className="responsive-text-sm font-medium text-gray-600 dark:text-gray-400">
                Net Worth
              </p>
              <p className="responsive-text-xl font-bold text-gray-900 dark:text-white truncate">
                ${(data?.netWorth || 0).toLocaleString()}
              </p>
              <p className="responsive-text-xs text-gray-500 dark:text-gray-400">
                Assets - Liabilities
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Income vs Expenses Chart */}
        <div className="card p-4 sm:p-6">
          <h3 className="responsive-text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Income vs Expenses (Last 6 Months)
          </h3>
          <div className="h-48 sm:h-64">
            <Line data={lineChartData} options={chartOptions} />
          </div>
        </div>

        {/* Expense Categories Chart */}
        <div className="card p-4 sm:p-6">
          <h3 className="responsive-text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Expense Categories (This Month)
          </h3>
          <div className="h-48 sm:h-64">
            <Doughnut data={doughnutChartData} options={chartOptions} />
          </div>
        </div>
      </div>

      {/* Recent Transactions */}
      <div className="card p-4 sm:p-6">
        <div className="mobile-flex items-center justify-between mb-4 gap-4">
          <h3 className="responsive-text-lg font-semibold text-gray-900 dark:text-white">
            Recent Transactions
          </h3>
          <Link
            href="/dashboard/transactions"
            className="text-primary-600 hover:text-primary-500 responsive-text-sm font-medium shrink-0"
          >
            View All
          </Link>
        </div>
        
        {data?.recentTransactions?.length === 0 ? (
          <div className="text-center py-8">
            <p className="responsive-text-sm text-gray-500 dark:text-gray-400">
              No transactions yet. Start by adding your first transaction.
            </p>
            <Link href="/dashboard/transactions/new">
              <Button
                variant="default"
                size="lg"
                animation="bounce"
                icon={<PlusIcon className="h-4 w-4" />}
                iconPosition="left"
                className="mt-4 w-full sm:w-auto"
              >
                Add Transaction
              </Button>
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {data?.recentTransactions?.slice(0, 5).map((transaction) => (
              <div
                key={transaction.id}
                className="flex items-center justify-between p-3 sm:p-4 bg-gray-50 dark:bg-gray-700 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors min-h-[60px]"
              >
                <div className="flex items-center min-w-0 flex-1">
                  <div className="text-xl sm:text-2xl mr-3 shrink-0">{transaction.category.icon}</div>
                  <div className="min-w-0 flex-1">
                    <p className="responsive-text-sm font-medium text-gray-900 dark:text-white truncate">
                      {transaction.description || transaction.category.name}
                    </p>
                    <p className="responsive-text-xs text-gray-500 dark:text-gray-400">
                      {new Date(transaction.date).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <div className="text-right ml-2 shrink-0">
                  <p
                    className={`responsive-text-sm font-semibold ${
                      transaction.type === 'INCOME'
                        ? 'text-green-600 dark:text-green-400'
                        : 'text-red-600 dark:text-red-400'
                    }`}
                  >
                    {transaction.type === 'INCOME' ? '+' : '-'}$
                    {transaction.amount.toLocaleString()}
                  </p>
                  <p className="responsive-text-xs text-gray-500 dark:text-gray-400 capitalize">
                    {transaction.type.toLowerCase()}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}