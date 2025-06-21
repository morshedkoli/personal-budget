'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../providers'
import LoadingSpinner from '../../components/ui/LoadingSpinner'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  BanknotesIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline'

interface Asset {
  id: string
  name: string
  type: string
  balance: number
  initialAmount: number
  description?: string
  createdAt: string
  updatedAt: string
}

interface Liability {
  id: string
  name: string
  type: string
  balance: number
  initialAmount: number
  interestRate?: number
  dueDate?: string
  description?: string
  createdAt: string
  updatedAt: string
}

export default function AssetsPage() {
  const { user } = useAuth()
  const [assets, setAssets] = useState<Asset[]>([])
  const [liabilities, setLiabilities] = useState<Liability[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAssetForm, setShowAssetForm] = useState(false)
  const [showLiabilityForm, setShowLiabilityForm] = useState(false)
  const [editingAsset, setEditingAsset] = useState<Asset | null>(null)
  const [editingLiability, setEditingLiability] = useState<Liability | null>(null)

  // Form states
  const [assetForm, setAssetForm] = useState({
    name: '',
    type: 'CASH',
    balance: '',
    initialAmount: '',
    description: '',
  })

  const [liabilityForm, setLiabilityForm] = useState({
    name: '',
    type: 'CREDIT_CARD',
    balance: '',
    initialAmount: '',
    interestRate: '',
    dueDate: '',
    description: '',
  })

  useEffect(() => {
    fetchAssets()
    fetchLiabilities()
  }, [])

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
      } else {
        setError('Failed to fetch assets')
      }
    } catch (error) {
      setError('An error occurred while fetching assets')
    } finally {
      setLoading(false)
    }
  }

  const fetchLiabilities = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/liabilities', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setLiabilities(data)
      }
    } catch (error) {
        // Failed to fetch liabilities
      }
  }

  const handleAssetSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const url = editingAsset ? `/api/assets/${editingAsset.id}` : '/api/assets'
      const method = editingAsset ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...assetForm,
          balance: parseFloat(assetForm.balance),
          initialAmount: parseFloat(assetForm.initialAmount),
        }),
      })

      if (response.ok) {
        fetchAssets()
        setShowAssetForm(false)
        setEditingAsset(null)
        setAssetForm({
          name: '',
          type: 'CASH',
          balance: '',
          initialAmount: '',
          description: '',
        })
      } else {
        alert('Failed to save asset')
      }
    } catch (error) {
      alert('An error occurred while saving the asset')
    }
  }

  const handleLiabilitySubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const url = editingLiability ? `/api/liabilities/${editingLiability.id}` : '/api/liabilities'
      const method = editingLiability ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...liabilityForm,
          balance: parseFloat(liabilityForm.balance),
          initialAmount: parseFloat(liabilityForm.initialAmount),
          interestRate: liabilityForm.interestRate ? parseFloat(liabilityForm.interestRate) : undefined,
          dueDate: liabilityForm.dueDate ? new Date(liabilityForm.dueDate).toISOString() : undefined,
        }),
      })

      if (response.ok) {
        fetchLiabilities()
        setShowLiabilityForm(false)
        setEditingLiability(null)
        setLiabilityForm({
          name: '',
          type: 'CREDIT_CARD',
          balance: '',
          initialAmount: '',
          interestRate: '',
          dueDate: '',
          description: '',
        })
      } else {
        alert('Failed to save liability')
      }
    } catch (error) {
      alert('An error occurred while saving the liability')
    }
  }

  const deleteAsset = async (id: string) => {
    if (!confirm('Are you sure you want to delete this asset?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/assets/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        fetchAssets()
      } else {
        alert('Failed to delete asset')
      }
    } catch (error) {
      alert('An error occurred while deleting the asset')
    }
  }

  const deleteLiability = async (id: string) => {
    if (!confirm('Are you sure you want to delete this liability?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/liabilities/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        fetchLiabilities()
      } else {
        alert('Failed to delete liability')
      }
    } catch (error) {
      alert('An error occurred while deleting the liability')
    }
  }

  const editAsset = (asset: Asset) => {
    setEditingAsset(asset)
    setAssetForm({
      name: asset.name,
      type: asset.type,
      balance: asset.balance.toString(),
      initialAmount: asset.initialAmount.toString(),
      description: asset.description || '',
    })
    setShowAssetForm(true)
  }

  const editLiability = (liability: Liability) => {
    setEditingLiability(liability)
    setLiabilityForm({
      name: liability.name,
      type: liability.type,
      balance: liability.balance.toString(),
      initialAmount: liability.initialAmount.toString(),
      interestRate: liability.interestRate?.toString() || '',
      dueDate: liability.dueDate ? new Date(liability.dueDate).toISOString().split('T')[0] : '',
      description: liability.description || '',
    })
    setShowLiabilityForm(true)
  }

  const totalAssets = assets.reduce((sum, asset) => sum + asset.balance, 0)
  const totalLiabilities = liabilities.reduce((sum, liability) => sum + liability.balance, 0)
  const netWorth = totalAssets - totalLiabilities

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Assets & Liabilities
        </h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <BanknotesIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Assets
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${totalAssets.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <CreditCardIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Total Liabilities
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${totalLiabilities.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <BanknotesIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Net Worth
              </p>
              <p className={`text-2xl font-bold ${
                netWorth >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                ${netWorth.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Assets Section */}
      <div className="card">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Assets
            </h2>
            <button
              onClick={() => setShowAssetForm(true)}
              className="btn btn-primary btn-md btn-glow flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <PlusIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Add Asset</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {assets.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No assets yet. Add your first asset to track your wealth.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Initial Amount
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {assets.map((asset) => (
                  <tr key={asset.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {asset.name}
                        </div>
                        {asset.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {asset.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {asset.type.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-400">
                      ${asset.balance.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      ${asset.initialAmount.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => editAsset(asset)}
                          className="btn btn-ghost btn-sm p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                          title="Edit Asset"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteAsset(asset.id)}
                          className="btn btn-ghost btn-sm p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                          title="Delete Asset"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Asset Form Modal */}
      {showAssetForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingAsset ? 'Edit Asset' : 'Add New Asset'}
            </h3>
            <form onSubmit={handleAssetSubmit} className="space-y-4">
              <div>
                <label className="label">Name</label>
                <input
                  type="text"
                  value={assetForm.name}
                  onChange={(e) => setAssetForm({ ...assetForm, name: e.target.value })}
                  className="input mt-1"
                  required
                />
              </div>
              <div>
                <label className="label">Type</label>
                <select
                  value={assetForm.type}
                  onChange={(e) => setAssetForm({ ...assetForm, type: e.target.value })}
                  className="input mt-1"
                >
                  <option value="CASH">Cash</option>
                  <option value="BANK_ACCOUNT">Bank Account</option>
                  <option value="INVESTMENT">Investment</option>
                  <option value="REAL_ESTATE">Real Estate</option>
                  <option value="VEHICLE">Vehicle</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="label">Current Balance</label>
                <input
                  type="number"
                  value={assetForm.balance}
                  onChange={(e) => setAssetForm({ ...assetForm, balance: e.target.value })}
                  className="input mt-1"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="label">Initial Amount</label>
                <input
                  type="number"
                  value={assetForm.initialAmount}
                  onChange={(e) => setAssetForm({ ...assetForm, initialAmount: e.target.value })}
                  className="input mt-1"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="label">Description (Optional)</label>
                <input
                  type="text"
                  value={assetForm.description}
                  onChange={(e) => setAssetForm({ ...assetForm, description: e.target.value })}
                  className="input mt-1"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowAssetForm(false)
                    setEditingAsset(null)
                    setAssetForm({
                      name: '',
                      type: 'CASH',
                      balance: '',
                      initialAmount: '',
                      description: '',
                    })
                  }}
                  className="btn btn-outline btn-md px-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-md px-6 btn-glow shadow-lg hover:shadow-xl transition-all duration-200">
                  {editingAsset ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Liabilities Section */}
      <div className="card">
        <div className="p-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
              Liabilities
            </h2>
            <button
              onClick={() => setShowLiabilityForm(true)}
              className="btn btn-primary btn-md btn-glow flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
            >
              <PlusIcon className="h-4 w-4" />
              <span className="hidden sm:inline">Add Liability</span>
              <span className="sm:hidden">Add</span>
            </button>
          </div>
        </div>

        {liabilities.length === 0 ? (
          <div className="p-6 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              No liabilities yet. Add your first liability to track your debts.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-800">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Type
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Balance
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Interest Rate
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Due Date
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                {liabilities.map((liability) => (
                  <tr key={liability.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900 dark:text-white">
                          {liability.name}
                        </div>
                        {liability.description && (
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {liability.description}
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white">
                      {liability.type.replace('_', ' ')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600 dark:text-red-400">
                      ${liability.balance.toLocaleString()}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {liability.interestRate ? `${liability.interestRate}%` : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {liability.dueDate ? new Date(liability.dueDate).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => editLiability(liability)}
                          className="btn btn-ghost btn-sm p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                          title="Edit Liability"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => deleteLiability(liability.id)}
                          className="btn btn-ghost btn-sm p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                          title="Delete Liability"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Liability Form Modal */}
      {showLiabilityForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingLiability ? 'Edit Liability' : 'Add New Liability'}
            </h3>
            <form onSubmit={handleLiabilitySubmit} className="space-y-4">
              <div>
                <label className="label">Name</label>
                <input
                  type="text"
                  value={liabilityForm.name}
                  onChange={(e) => setLiabilityForm({ ...liabilityForm, name: e.target.value })}
                  className="input mt-1"
                  required
                />
              </div>
              <div>
                <label className="label">Type</label>
                <select
                  value={liabilityForm.type}
                  onChange={(e) => setLiabilityForm({ ...liabilityForm, type: e.target.value })}
                  className="input mt-1"
                >
                  <option value="CREDIT_CARD">Credit Card</option>
                  <option value="LOAN">Loan</option>
                  <option value="MORTGAGE">Mortgage</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div>
                <label className="label">Current Balance</label>
                <input
                  type="number"
                  value={liabilityForm.balance}
                  onChange={(e) => setLiabilityForm({ ...liabilityForm, balance: e.target.value })}
                  className="input mt-1"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="label">Initial Amount</label>
                <input
                  type="number"
                  value={liabilityForm.initialAmount}
                  onChange={(e) => setLiabilityForm({ ...liabilityForm, initialAmount: e.target.value })}
                  className="input mt-1"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="label">Interest Rate (%)</label>
                <input
                  type="number"
                  value={liabilityForm.interestRate}
                  onChange={(e) => setLiabilityForm({ ...liabilityForm, interestRate: e.target.value })}
                  className="input mt-1"
                  step="0.01"
                  min="0"
                  max="100"
                />
              </div>
              <div>
                <label className="label">Due Date</label>
                <input
                  type="date"
                  value={liabilityForm.dueDate}
                  onChange={(e) => setLiabilityForm({ ...liabilityForm, dueDate: e.target.value })}
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="label">Description (Optional)</label>
                <input
                  type="text"
                  value={liabilityForm.description}
                  onChange={(e) => setLiabilityForm({ ...liabilityForm, description: e.target.value })}
                  className="input mt-1"
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowLiabilityForm(false)
                    setEditingLiability(null)
                    setLiabilityForm({
                      name: '',
                      type: 'CREDIT_CARD',
                      balance: '',
                      initialAmount: '',
                      interestRate: '',
                      dueDate: '',
                      description: '',
                    })
                  }}
                  className="btn btn-outline btn-md px-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-md px-6 btn-glow shadow-lg hover:shadow-xl transition-all duration-200">
                  {editingLiability ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}