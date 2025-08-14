import { useState, useEffect } from 'react'
import { DollarSign, TrendingUp, TrendingDown, AlertTriangle, Target, Edit, Save, X } from 'lucide-react'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const Budget = () => {
  const [budgetData, setBudgetData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [newBudget, setNewBudget] = useState('')
  const [updating, setUpdating] = useState(false)

  useEffect(() => {
    fetchBudgetData()
  }, [])

  const fetchBudgetData = async () => {
    try {
      const response = await api.get('/budget')
      setBudgetData(response.data)
      setNewBudget(response.data.monthlyBudget.toString())
    } catch (error) {
      toast.error('Failed to fetch budget data')
      console.error('Fetch budget error:', error)
    }
    setLoading(false)
  }

  const handleUpdateBudget = async () => {
    if (!newBudget || parseFloat(newBudget) < 0) {
      toast.error('Please enter a valid budget amount')
      return
    }

    setUpdating(true)
    try {
      await api.put('/budget', { monthlyBudget: parseFloat(newBudget) })
      toast.success('Budget updated successfully')
      setEditing(false)
      fetchBudgetData()
    } catch (error) {
      toast.error('Failed to update budget')
      console.error('Update budget error:', error)
    }
    setUpdating(false)
  }

  const handleCancelEdit = () => {
    setEditing(false)
    setNewBudget(budgetData?.monthlyBudget.toString() || '')
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  const getBudgetStatus = () => {
    if (!budgetData || budgetData.monthlyBudget === 0) return null
    const utilization = budgetData.budgetUtilization
    if (utilization >= 100) {
      return { status: 'exceeded', color: 'red', icon: TrendingDown }
    } else if (utilization >= 80) {
      return { status: 'warning', color: 'yellow', icon: AlertTriangle }
    } else {
      return { status: 'good', color: 'green', icon: TrendingUp }
    }
  }

  const budgetStatus = getBudgetStatus()

  return (
    <div className="space-y-6 bg-gray-900 text-gray-100 p-6 rounded-xl shadow-lg">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white">💰 Budget Management</h1>
        <p className="text-gray-400">Set and track your monthly spending budget</p>
      </div>

      {/* Budget Alert */}
      {budgetData?.alert && (
        <div
          className={`p-4 rounded-lg border shadow-md ${
            budgetData.alert.type === 'danger'
              ? 'bg-red-900/30 border-red-700 text-red-300'
              : budgetData.alert.type === 'warning'
              ? 'bg-yellow-900/30 border-yellow-700 text-yellow-300'
              : 'bg-blue-900/30 border-blue-700 text-blue-300'
          }`}
        >
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 mr-3" />
            <p className="text-sm font-medium">{budgetData.alert.message}</p>
          </div>
        </div>
      )}

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          {
            title: 'Monthly Budget',
            value: `₹${budgetData?.monthlyBudget || 0}`,
            icon: <Target className="w-6 h-6 text-blue-400" />,
            bg: 'bg-blue-900/30 border-blue-700'
          },
          {
            title: 'Total Spent',
            value: `₹${budgetData?.totalSpent || 0}`,
            icon: <DollarSign className="w-6 h-6 text-red-400" />,
            bg: 'bg-red-900/30 border-red-700'
          },
          {
            title: budgetData?.remainingBudget >= 0 ? 'Remaining' : 'Over Budget',
            value: `₹${Math.abs(budgetData?.remainingBudget || 0)}`,
            icon: (
              <DollarSign
                className={`w-6 h-6 ${
                  budgetData?.remainingBudget >= 0 ? 'text-green-400' : 'text-red-400'
                }`}
              />
            ),
            bg:
              budgetData?.remainingBudget >= 0
                ? 'bg-green-900/30 border-green-700'
                : 'bg-red-900/30 border-red-700'
          },
          {
            title: 'Budget Used',
            value: `${budgetData?.budgetUtilization || 0}%`,
            icon: budgetStatus?.icon && (
              <budgetStatus.icon
                className={`w-6 h-6 ${
                  budgetStatus.color === 'green'
                    ? 'text-green-400'
                    : budgetStatus.color === 'yellow'
                    ? 'text-yellow-400'
                    : 'text-red-400'
                }`}
              />
            ),
            bg:
              budgetStatus?.color === 'green'
                ? 'bg-green-900/30 border-green-700'
                : budgetStatus?.color === 'yellow'
                ? 'bg-yellow-900/30 border-yellow-700'
                : 'bg-red-900/30 border-red-700'
          }
        ].map((card, i) => (
          <div key={i} className={`rounded-lg border p-6 shadow-md ${card.bg}`}>
            <div className="flex items-center">
              <div className="p-2 rounded-lg bg-black/20">{card.icon}</div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-400">{card.title}</p>
                <p className="text-2xl font-semibold text-white">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Budget Management Section */}
      <div className="bg-gray-800 rounded-lg shadow p-6 border border-gray-700">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold">Monthly Budget Settings</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center space-x-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Budget</span>
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Monthly Budget Amount (₹)
            </label>
            <div className="flex space-x-4">
              <input
                type="number"
                step="0.01"
                min="0"
                value={newBudget}
                onChange={(e) => setNewBudget(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-600 bg-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 text-white"
                placeholder="Enter your monthly budget"
              />
              <button
                onClick={handleUpdateBudget}
                disabled={updating}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 disabled:opacity-50 flex items-center space-x-2"
              >
                {updating ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}
                <span>Save</span>
              </button>
              <button
                onClick={handleCancelEdit}
                className="bg-gray-700 text-gray-300 px-4 py-2 rounded-lg hover:bg-gray-600 flex items-center space-x-2"
              >
                <X className="w-4 h-4" />
                <span>Cancel</span>
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-8 text-gray-300">
            {budgetData?.monthlyBudget > 0 ? (
              <>
                <p className="mb-2">Your current monthly budget is</p>
                <p className="text-3xl font-bold text-indigo-400">
                  ₹{budgetData.monthlyBudget}
                </p>
                <p className="text-sm mt-2">Click "Edit Budget" to make changes</p>
              </>
            ) : (
              <>
                <p className="mb-4">You haven't set a monthly budget yet</p>
                <p className="text-sm">Click "Edit Budget" to start tracking</p>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

export default Budget
