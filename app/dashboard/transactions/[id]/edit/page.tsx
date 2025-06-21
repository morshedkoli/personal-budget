'use client'

import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { useAuth } from '../../../../providers'
import LoadingSpinner from '../../../../components/ui/LoadingSpinner'
import { ArrowLeftIcon } from '@heroicons/react/24/outline'
import Link from 'next/link'

interface Category {
  id: string
  name: string
  type: 'INCOME' | 'EXPENSE'
  icon: string
  color: string
}

interface Asset {
  id: string
  name: string
  type: string
  balance: number
}

interface Transaction {
  id: string
  amount: number
  description: string
  date: string
  type: 'INCOME' | 'EXPENSE' | 'TRANSFER'
  categoryId: string
  fromAssetId?: string
  toAssetId?: string
  category: {
    id: string
    name: string
    icon: string
    color: string
  }
}

export default function EditTransactionPage() {
  const { user } = useAuth()
  const router = useRouter()
  const params = useParams()
  const transactionId = params.id as string
  
  const [loading, setLoading] = useState(false)
  const [initialLoading, setInitialLoading] = useState(true)
  const [categories, setCategories] = useState<Category[]>([])
  const [assets, setAssets] = useState<Asset[]>([])
  const [error, setError] = useState('')
  const [transaction, setTransaction] = useState<Transaction | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    description: '',
    date: '',
    type: 'EXPENSE' as 'INCOME' | 'EXPENSE' | 'TRANSFER',
    categoryId: '',
    fromAssetId: '',
    toAssetId: '',
  })

  useEffect(() => {
    fetchTransaction()
    fetchAssets()
  }, [])

  useEffect(() => {
    // Reset category when type changes
    setFormData(prev => ({ ...prev, categoryId: '' }))
    fetchCategories()
  }, [formData.type])

  const fetchTransaction = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/transactions/${transactionId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setTransaction(data)
        
        // Populate form with existing data
        setFormData({
          amount: data.amount.toString(),
          description: data.description || '',
          date: new Date(data.date).toISOString().split('T')[0],
          type: data.type,
          categoryId: data.categoryId || '',
          fromAssetId: data.fromAssetId || '',
          toAssetId: data.toAssetId || '',
        })
      } else {
        setError('Transaction not found')
      }
    } catch (error) {
        setError('Failed to load transaction')
      } finally {
      setInitialLoading(false)
    }
  }

  const fetchCategories = async () => {
    try {
      const token = localStorage.getItem('token')
      const typeParam = formData.type !== 'TRANSFER' ? `?type=${formData.type}` : ''
      const response = await fetch(`/api/categories${typeParam}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setCategories(data)
      }
    } catch (error) {
        // Failed to fetch categories
      }
  }

  const fetchAssets = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/assets', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setAssets(data)
      }
    } catch (error) {
        // Failed to fetch assets
      }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const token = localStorage.getItem('token')
      const submitData = {
        amount: parseFloat(formData.amount),
        description: formData.description,
        date: new Date(formData.date).toISOString(),
        type: formData.type,
        categoryId: formData.categoryId,
        ...(formData.type === 'TRANSFER' && {
          fromAssetId: formData.fromAssetId,
          toAssetId: formData.toAssetId,
        }),
      }

      const response = await fetch(`/api/transactions/${transactionId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(submitData),
      })

      if (response.ok) {
        router.push('/dashboard/transactions')
      } else {
        const errorData = await response.json()
        setError(errorData.error || 'Failed to update transaction')
      }
    } catch (error) {
      setError('An error occurred while updating the transaction')
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  if (error && !transaction) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <Link
            href="/dashboard/transactions"
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md"
          >
            <ArrowLeftIcon className="h-5 w-5" />
          </Link>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Edit Transaction
          </h1>
        </div>
        <div className="text-red-600 dark:text-red-400">
          {error}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-4">
        <Link
          href="/dashboard/transactions"
          className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 rounded-md"
        >
          <ArrowLeftIcon className="h-5 w-5" />
        </Link>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Edit Transaction
        </h1>
      </div>

      {/* Form */}
      <div className="max-w-2xl">
        <form onSubmit={handleSubmit} className="card p-6 space-y-6">
          {/* Transaction Type */}
          <div>
            <label className="label text-gray-900 dark:text-gray-100">Transaction Type</label>
            <select
              name="type"
              value={formData.type}
              onChange={handleInputChange}
              className="input mt-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
              required
            >
              <option value="EXPENSE">Expense</option>
              <option value="INCOME">Income</option>
              <option value="TRANSFER">Transfer</option>
            </select>
          </div>

          {/* Amount */}
          <div>
            <label className="label text-gray-900 dark:text-gray-100">Amount</label>
            <input
              type="number"
              name="amount"
              value={formData.amount}
              onChange={handleInputChange}
              className="input mt-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="0.00"
              step="0.01"
              min="0"
              required
            />
          </div>

          {/* Description */}
          <div>
            <label className="label text-gray-900 dark:text-gray-100">Description</label>
            <input
              type="text"
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              className="input mt-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 placeholder-gray-500 dark:placeholder-gray-400"
              placeholder="Enter transaction description"
            />
          </div>

          {/* Date */}
          <div>
            <label className="label text-gray-900 dark:text-gray-100">Date</label>
            <input
              type="date"
              name="date"
              value={formData.date}
              onChange={handleInputChange}
              className="input mt-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600 focus:ring-blue-500 dark:focus:ring-blue-400 focus:border-blue-500 dark:focus:border-blue-400 [color-scheme:light] dark:[color-scheme:dark]"
              required
            />
          </div>

          {/* Category (for Income/Expense) */}
          {formData.type !== 'TRANSFER' && (
            <div>
              <label className="label text-gray-900 dark:text-gray-100">Category</label>
              <select
                name="categoryId"
                value={formData.categoryId}
                onChange={handleInputChange}
                className="input mt-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                required
              >
                <option value="">Select a category</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.icon} {category.name}
                  </option>
                ))}
              </select>
              {categories.length === 0 && (
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                  No categories available. Create one first.
                </p>
              )}
            </div>
          )}

          {/* Transfer Fields */}
          {formData.type === 'TRANSFER' && (
            <>
              <div>
                <label className="label text-gray-900 dark:text-gray-100">From Asset</label>
                <select
                  name="fromAssetId"
                  value={formData.fromAssetId}
                  onChange={handleInputChange}
                  className="input mt-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                  required
                >
                  <option value="">Select source asset</option>
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} (${asset.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="label text-gray-900 dark:text-gray-100">To Asset</label>
                <select
                  name="toAssetId"
                  value={formData.toAssetId}
                  onChange={handleInputChange}
                  className="input mt-1 bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-100 border-gray-300 dark:border-gray-600"
                  required
                >
                  <option value="">Select destination asset</option>
                  {assets.map((asset) => (
                    <option key={asset.id} value={asset.id}>
                      {asset.name} (${asset.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              {/* Hidden category field for transfers */}
              <input type="hidden" name="categoryId" value="transfer" />
            </>
          )}

          {/* Error Message */}
          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <div className="flex items-center justify-end space-x-4">
            <Link
              href="/dashboard/transactions"
              className="btn btn-outline btn-md px-6 shadow-md hover:shadow-lg transition-all duration-200"
            >
              Cancel
            </Link>
            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary btn-md px-6 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 btn-glow flex items-center"
            >
              {loading && <LoadingSpinner size="sm" className="mr-2" />}
              Update Transaction
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}