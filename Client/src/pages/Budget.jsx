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
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Budget Management</h1>
        <p className="text-gray-600">Set and track your monthly spending budget</p>
      </div>

      {/* Budget Alert */}
      {budgetData?.alert && (
        <div className={`p-4 rounded-lg border ${
          budgetData.alert.type === 'danger' ? 'bg-red-50 border-red-200' :
          budgetData.alert.type === 'warning' ? 'bg-yellow-50 border-yellow-200' :
          'bg-blue-50 border-blue-200'
        }`}>
          <div className="flex items-center">
            <AlertTriangle className={`w-5 h-5 mr-3 ${
              budgetData.alert.type === 'danger' ? 'text-red-600' :
              budgetData.alert.type === 'warning' ? 'text-yellow-600' :
              'text-blue-600'
            }`} />
            <p className={`text-sm font-medium ${
              budgetData.alert.type === 'danger' ? 'text-red-800' :
              budgetData.alert.type === 'warning' ? 'text-yellow-800' :
              'text-blue-800'
            }`}>
              {budgetData.alert.message}
            </p>
          </div>
        </div>
      )}

      {/* Budget Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-blue-100">
              <Target className="w-6 h-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Monthly Budget</p>
              <p className="text-2xl font-semibold text-gray-900">
                ₹{budgetData?.monthlyBudget || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className="p-2 rounded-lg bg-red-100">
              <DollarSign className="w-6 h-6 text-red-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Total Spent</p>
              <p className="text-2xl font-semibold text-red-600">
                ₹{budgetData?.totalSpent || 0}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${
              budgetData?.remainingBudget >= 0 ? 'bg-green-100' : 'bg-red-100'
            }`}>
              <DollarSign className={`w-6 h-6 ${
                budgetData?.remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'
              }`} />
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">
                {budgetData?.remainingBudget >= 0 ? 'Remaining' : 'Over Budget'}
              </p>
              <p className={`text-2xl font-semibold ${
                budgetData?.remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'
              }`}>
                ₹{Math.abs(budgetData?.remainingBudget || 0)}
              </p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center">
            <div className={`p-2 rounded-lg ${
              budgetStatus?.color === 'green' ? 'bg-green-100' :
              budgetStatus?.color === 'yellow' ? 'bg-yellow-100' :
              'bg-red-100'
            }`}>
              {budgetStatus?.icon && (
                <budgetStatus.icon className={`w-6 h-6 ${
                  budgetStatus.color === 'green' ? 'text-green-600' :
                  budgetStatus.color === 'yellow' ? 'text-yellow-600' :
                  'text-red-600'
                }`} />
              )}
            </div>
            <div className="ml-4">
              <p className="text-sm font-medium text-gray-600">Budget Used</p>
              <p className="text-2xl font-semibold text-gray-900">
                {budgetData?.budgetUtilization || 0}%
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Budget Management Section */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-semibold text-gray-900">Monthly Budget Settings</h2>
          {!editing && (
            <button
              onClick={() => setEditing(true)}
              className="flex items-center space-x-2 bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <Edit className="w-4 h-4" />
              <span>Edit Budget</span>
            </button>
          )}
        </div>

        {editing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Monthly Budget Amount (₹)
              </label>
              <div className="flex space-x-4">
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newBudget}
                  onChange={(e) => setNewBudget(e.target.value)}
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
                  placeholder="Enter your monthly budget"
                />
                <button
                  onClick={handleUpdateBudget}
                  disabled={updating}
                  className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50 flex items-center space-x-2"
                >
                  {updating ? <LoadingSpinner size="sm" /> : <Save className="w-4 h-4" />}
                  <span>Save</span>
                </button>
                <button
                  onClick={handleCancelEdit}
                  className="bg-gray-300 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-400 focus:outline-none focus:ring-2 focus:ring-gray-500 flex items-center space-x-2"
                >
                  <X className="w-4 h-4" />
                  <span>Cancel</span>
                </button>
              </div>
            </div>
            <p className="text-sm text-gray-600">
              Set a realistic monthly budget to help you track your spending habits.
            </p>
          </div>
        ) : (
          <div className="text-center py-8">
            {budgetData?.monthlyBudget > 0 ? (
              <div>
                <p className="text-lg text-gray-600 mb-2">
                  Your current monthly budget is
                </p>
                <p className="text-3xl font-bold text-primary-600">
                  ₹{budgetData.monthlyBudget}
                </p>
                <p className="text-sm text-gray-500 mt-2">
                  Click "Edit Budget" to make changes
                </p>
              </div>
            ) : (
              <div>
                <p className="text-lg text-gray-600 mb-4">
                  You haven't set a monthly budget yet
                </p>
                <p className="text-sm text-gray-500">
                  Click "Edit Budget" to set your first budget and start tracking your expenses
                </p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Budget Progress Visualization */}
      {budgetData?.monthlyBudget > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Progress</h2>
          
          <div className="space-y-4">
            <div className="flex justify-between text-sm text-gray-600">
              <span>Progress</span>
              <span>{budgetData.budgetUtilization}% used</span>
            </div>
            
            <div className="w-full bg-gray-200 rounded-full h-4">
              <div
                className={`h-4 rounded-full transition-all duration-300 ${
                  budgetData.budgetUtilization >= 100 ? 'bg-red-600' :
                  budgetData.budgetUtilization >= 80 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(budgetData.budgetUtilization, 100)}%` }}
              ></div>
            </div>

            <div className="grid grid-cols-3 gap-4 mt-6">
              <div className="text-center">
                <p className="text-sm text-gray-600">Budget</p>
                <p className="text-lg font-semibold text-gray-900">₹{budgetData.monthlyBudget}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">Spent</p>
                <p className="text-lg font-semibold text-red-600">₹{budgetData.totalSpent}</p>
              </div>
              <div className="text-center">
                <p className="text-sm text-gray-600">
                  {budgetData.remainingBudget >= 0 ? 'Remaining' : 'Over'}
                </p>
                <p className={`text-lg font-semibold ${
                  budgetData.remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'
                }`}>
                  ₹{Math.abs(budgetData.remainingBudget)}
                </p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Budget Tips */}
      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Tips</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 bg-blue-50 rounded-lg">
            <h3 className="font-medium text-blue-900 mb-2">Track Daily</h3>
            <p className="text-sm text-blue-800">
              Record your expenses daily to stay on top of your spending habits.
            </p>
          </div>
          <div className="p-4 bg-green-50 rounded-lg">
            <h3 className="font-medium text-green-900 mb-2">Set Realistic Goals</h3>
            <p className="text-sm text-green-800">
              Create achievable budgets based on your actual spending patterns.
            </p>
          </div>
          <div className="p-4 bg-yellow-50 rounded-lg">
            <h3 className="font-medium text-yellow-900 mb-2">Review Monthly</h3>
            <p className="text-sm text-yellow-800">
              Analyze your spending at the end of each month to improve next month.
            </p>
          </div>
          <div className="p-4 bg-purple-50 rounded-lg">
            <h3 className="font-medium text-purple-900 mb-2">Emergency Fund</h3>
            <p className="text-sm text-purple-800">
              Keep some budget aside for unexpected expenses that may arise.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Budget