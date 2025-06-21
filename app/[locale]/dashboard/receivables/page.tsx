'use client'

import { useEffect, useState } from 'react'
import { useAuth } from '../../../providers'
import LoadingSpinner from '../../../components/ui/LoadingSpinner'
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  CheckIcon,
  XMarkIcon,
  UserIcon,
  CurrencyDollarIcon,
} from '@heroicons/react/24/outline'

interface Receivable {
  id: string
  description: string
  amount: number
  dueDate?: string
  isPaid: boolean
  paidDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

interface Payable {
  id: string
  description: string
  amount: number
  dueDate?: string
  isPaid: boolean
  paidDate?: string
  notes?: string
  createdAt: string
  updatedAt: string
}

export default function ReceivablesPage() {
  const { user } = useAuth()
  const [receivables, setReceivables] = useState<Receivable[]>([])
  const [payables, setPayables] = useState<Payable[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showReceivableForm, setShowReceivableForm] = useState(false)
  const [showPayableForm, setShowPayableForm] = useState(false)
  const [editingReceivable, setEditingReceivable] = useState<Receivable | null>(null)
  const [editingPayable, setEditingPayable] = useState<Payable | null>(null)
  const [activeTab, setActiveTab] = useState<'receivables' | 'payables'>('receivables')

  // Form states
  const [receivableForm, setReceivableForm] = useState({
    description: '',
    amount: '',
    dueDate: '',
    notes: '',
  })

  const [payableForm, setPayableForm] = useState({
    description: '',
    amount: '',
    dueDate: '',
    notes: '',
  })

  useEffect(() => {
    fetchReceivables()
    fetchPayables()
  }, [])

  const fetchReceivables = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/receivables', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setReceivables(data)
      } else {
        setError('Failed to fetch receivables')
      }
    } catch (error) {
      setError('An error occurred while fetching receivables')
    } finally {
      setLoading(false)
    }
  }

  const fetchPayables = async () => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch('/api/payables', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setPayables(data)
      }
    } catch (error) {
        // Failed to fetch payables
      }
  }

  const handleReceivableSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const url = editingReceivable ? `/api/receivables/${editingReceivable.id}` : '/api/receivables'
      const method = editingReceivable ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...receivableForm,
          amount: parseFloat(receivableForm.amount),
          dueDate: receivableForm.dueDate ? new Date(receivableForm.dueDate).toISOString() : undefined,
        }),
      })

      if (response.ok) {
        fetchReceivables()
        setShowReceivableForm(false)
        setEditingReceivable(null)
        setReceivableForm({
          description: '',
          amount: '',
          dueDate: '',
          notes: '',
        })
      } else {
        alert('Failed to save receivable')
      }
    } catch (error) {
      alert('An error occurred while saving the receivable')
    }
  }

  const handlePayableSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem('token')
      const url = editingPayable ? `/api/payables/${editingPayable.id}` : '/api/payables'
      const method = editingPayable ? 'PUT' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...payableForm,
          amount: parseFloat(payableForm.amount),
          dueDate: payableForm.dueDate ? new Date(payableForm.dueDate).toISOString() : undefined,
        }),
      })

      if (response.ok) {
        fetchPayables()
        setShowPayableForm(false)
        setEditingPayable(null)
        setPayableForm({
          description: '',
          amount: '',
          dueDate: '',
          notes: '',
        })
      } else {
        alert('Failed to save payable')
      }
    } catch (error) {
      alert('An error occurred while saving the payable')
    }
  }

  const markReceivableAsPaid = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/receivables/${id}/mark-paid`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        fetchReceivables()
      } else {
        alert('Failed to mark receivable as paid')
      }
    } catch (error) {
      alert('An error occurred while updating the receivable')
    }
  }

  const markPayableAsPaid = async (id: string) => {
    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/payables/${id}/mark-paid`, {
        method: 'PATCH',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        fetchPayables()
      } else {
        alert('Failed to mark payable as paid')
      }
    } catch (error) {
      alert('An error occurred while updating the payable')
    }
  }

  const deleteReceivable = async (id: string) => {
    if (!confirm('Are you sure you want to delete this receivable?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/receivables/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        fetchReceivables()
      } else {
        alert('Failed to delete receivable')
      }
    } catch (error) {
      alert('An error occurred while deleting the receivable')
    }
  }

  const deletePayable = async (id: string) => {
    if (!confirm('Are you sure you want to delete this payable?')) return

    try {
      const token = localStorage.getItem('token')
      const response = await fetch(`/api/payables/${id}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.ok) {
        fetchPayables()
      } else {
        alert('Failed to delete payable')
      }
    } catch (error) {
      alert('An error occurred while deleting the payable')
    }
  }

  const editReceivable = (receivable: Receivable) => {
    setEditingReceivable(receivable)
    setReceivableForm({
      description: receivable.description,
      amount: receivable.amount.toString(),
      dueDate: receivable.dueDate ? new Date(receivable.dueDate).toISOString().split('T')[0] : '',
      notes: receivable.notes || '',
    })
    setShowReceivableForm(true)
  }

  const editPayable = (payable: Payable) => {
    setEditingPayable(payable)
    setPayableForm({
      description: payable.description,
      amount: payable.amount.toString(),
      dueDate: payable.dueDate ? new Date(payable.dueDate).toISOString().split('T')[0] : '',
      notes: payable.notes || '',
    })
    setShowPayableForm(true)
  }

  const totalReceivables = receivables.filter(r => !r.isPaid).reduce((sum, r) => sum + r.amount, 0)
  const totalPayables = payables.filter(p => !p.isPaid).reduce((sum, p) => sum + p.amount, 0)
  const netReceivables = totalReceivables - totalPayables

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
          Receivables & Payables
        </h1>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 dark:bg-green-900 rounded-lg">
              <UserIcon className="h-6 w-6 text-green-600 dark:text-green-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Outstanding Receivables
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${totalReceivables.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-red-100 dark:bg-red-900 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Outstanding Payables
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                ${totalPayables.toLocaleString()}
              </p>
            </div>
          </div>
        </div>

        <div className="card p-6">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 dark:bg-blue-900 rounded-lg">
              <CurrencyDollarIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                Net Position
              </p>
              <p className={`text-2xl font-bold ${
                netReceivables >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'
              }`}>
                ${netReceivables.toLocaleString()}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('receivables')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'receivables'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Receivables ({receivables.filter(r => !r.isPaid).length})
          </button>
          <button
            onClick={() => setActiveTab('payables')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${
              activeTab === 'payables'
                ? 'border-primary-500 text-primary-600 dark:text-primary-400'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-300'
            }`}
          >
            Payables ({payables.filter(p => !p.isPaid).length})
          </button>
        </nav>
      </div>

      {/* Receivables Tab */}
      {activeTab === 'receivables' && (
        <div className="card">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Receivables
              </h2>
              <button
                onClick={() => setShowReceivableForm(true)}
                className="btn btn-primary btn-md btn-glow flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <PlusIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Add Receivable</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>

          {receivables.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No receivables yet. Add your first receivable to track money owed to you.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {receivables.map((receivable) => (
                    <tr key={receivable.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {receivable.description}
                          </div>
                          {receivable.notes && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {receivable.notes}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600 dark:text-green-400">
                        ${receivable.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {receivable.dueDate ? new Date(receivable.dueDate).toLocaleDateString() : 'No due date'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          receivable.isPaid
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        }`}>
                          {receivable.isPaid ? 'Paid' : 'Outstanding'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {!receivable.isPaid && (
                            <button
                              onClick={() => markReceivableAsPaid(receivable.id)}
                              className="btn btn-ghost btn-sm p-2 text-green-600 hover:text-green-800 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200"
                              title="Mark as paid"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => editReceivable(receivable)}
                            className="btn btn-ghost btn-sm p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                            title="Edit Receivable"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deleteReceivable(receivable.id)}
                            className="btn btn-ghost btn-sm p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                            title="Delete Receivable"
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
      )}

      {/* Payables Tab */}
      {activeTab === 'payables' && (
        <div className="card">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Payables
              </h2>
              <button
                onClick={() => setShowPayableForm(true)}
                className="btn btn-primary btn-md btn-glow flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
              >
                <PlusIcon className="h-4 w-4" />
                <span className="hidden sm:inline">Add Payable</span>
                <span className="sm:hidden">Add</span>
              </button>
            </div>
          </div>

          {payables.length === 0 ? (
            <div className="p-6 text-center">
              <p className="text-gray-500 dark:text-gray-400">
                No payables yet. Add your first payable to track money you owe.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Description
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Due Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200 dark:divide-gray-700">
                  {payables.map((payable) => (
                    <tr key={payable.id} className="hover:bg-gray-50 dark:hover:bg-gray-800">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {payable.description}
                          </div>
                          {payable.notes && (
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {payable.notes}
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-red-600 dark:text-red-400">
                        ${payable.amount.toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                        {payable.dueDate ? new Date(payable.dueDate).toLocaleDateString() : 'No due date'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          payable.isPaid
                            ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
                            : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                        }`}>
                          {payable.isPaid ? 'Paid' : 'Outstanding'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          {!payable.isPaid && (
                            <button
                              onClick={() => markPayableAsPaid(payable.id)}
                              className="btn btn-ghost btn-sm p-2 text-green-600 hover:text-green-800 hover:bg-green-50 dark:text-green-400 dark:hover:text-green-300 dark:hover:bg-green-900/20 rounded-lg transition-all duration-200"
                              title="Mark as paid"
                            >
                              <CheckIcon className="h-4 w-4" />
                            </button>
                          )}
                          <button
                            onClick={() => editPayable(payable)}
                            className="btn btn-ghost btn-sm p-2 text-blue-600 hover:text-blue-800 hover:bg-blue-50 dark:text-blue-400 dark:hover:text-blue-300 dark:hover:bg-blue-900/20 rounded-lg transition-all duration-200"
                            title="Edit Payable"
                          >
                            <PencilIcon className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => deletePayable(payable.id)}
                            className="btn btn-ghost btn-sm p-2 text-red-600 hover:text-red-800 hover:bg-red-50 dark:text-red-400 dark:hover:text-red-300 dark:hover:bg-red-900/20 rounded-lg transition-all duration-200"
                            title="Delete Payable"
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
      )}

      {/* Receivable Form Modal */}
      {showReceivableForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingReceivable ? 'Edit Receivable' : 'Add New Receivable'}
            </h3>
            <form onSubmit={handleReceivableSubmit} className="space-y-4">
              <div>
                <label className="label">Description</label>
                <input
                  type="text"
                  value={receivableForm.description}
                  onChange={(e) => setReceivableForm({ ...receivableForm, description: e.target.value })}
                  className="input mt-1"
                  required
                />
              </div>
              <div>
                <label className="label">Amount</label>
                <input
                  type="number"
                  value={receivableForm.amount}
                  onChange={(e) => setReceivableForm({ ...receivableForm, amount: e.target.value })}
                  className="input mt-1"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="label">Due Date (Optional)</label>
                <input
                  type="date"
                  value={receivableForm.dueDate}
                  onChange={(e) => setReceivableForm({ ...receivableForm, dueDate: e.target.value })}
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="label">Notes (Optional)</label>
                <textarea
                  value={receivableForm.notes}
                  onChange={(e) => setReceivableForm({ ...receivableForm, notes: e.target.value })}
                  className="input mt-1"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowReceivableForm(false)
                    setEditingReceivable(null)
                    setReceivableForm({
                      description: '',
                      amount: '',
                      dueDate: '',
                      notes: '',
                    })
                  }}
                  className="btn btn-outline btn-md px-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-md px-6 btn-glow shadow-lg hover:shadow-xl transition-all duration-200">
                  {editingReceivable ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Payable Form Modal */}
      {showPayableForm && (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              {editingPayable ? 'Edit Payable' : 'Add New Payable'}
            </h3>
            <form onSubmit={handlePayableSubmit} className="space-y-4">
              <div>
                <label className="label">Description</label>
                <input
                  type="text"
                  value={payableForm.description}
                  onChange={(e) => setPayableForm({ ...payableForm, description: e.target.value })}
                  className="input mt-1"
                  required
                />
              </div>
              <div>
                <label className="label">Amount</label>
                <input
                  type="number"
                  value={payableForm.amount}
                  onChange={(e) => setPayableForm({ ...payableForm, amount: e.target.value })}
                  className="input mt-1"
                  step="0.01"
                  required
                />
              </div>
              <div>
                <label className="label">Due Date (Optional)</label>
                <input
                  type="date"
                  value={payableForm.dueDate}
                  onChange={(e) => setPayableForm({ ...payableForm, dueDate: e.target.value })}
                  className="input mt-1"
                />
              </div>
              <div>
                <label className="label">Notes (Optional)</label>
                <textarea
                  value={payableForm.notes}
                  onChange={(e) => setPayableForm({ ...payableForm, notes: e.target.value })}
                  className="input mt-1"
                  rows={3}
                />
              </div>
              <div className="flex justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPayableForm(false)
                    setEditingPayable(null)
                    setPayableForm({
                      description: '',
                      amount: '',
                      dueDate: '',
                      notes: '',
                    })
                  }}
                  className="btn btn-outline btn-md px-6 hover:bg-gray-50 dark:hover:bg-gray-700 transition-all duration-200"
                >
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary btn-md px-6 btn-glow shadow-lg hover:shadow-xl transition-all duration-200">
                  {editingPayable ? 'Update' : 'Create'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}