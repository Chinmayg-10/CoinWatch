import { useState, useEffect } from 'react'
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { DollarSign, TrendingUp, AlertTriangle, Calendar, Receipt, ShoppingCart, Bus, HeartPulse, Utensils } from 'lucide-react'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'
import { motion } from "framer-motion"

const Dashboard = () => {
  const [dashboardData, setDashboardData] = useState(null)
  const [budgetData, setBudgetData] = useState(null)
  const [categoryData, setCategoryData] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      const [dashboardRes, budgetRes, categoryRes, monthlyRes] = await Promise.all([
        api.get('/analytics/dashboard'),
        api.get('/budget'),
        api.get('/analytics/category'),
        api.get('/analytics/monthly?months=6')
      ])

      setDashboardData(dashboardRes.data)
      setBudgetData(budgetRes.data)
      setCategoryData(categoryRes.data.categories)
      setMonthlyData(monthlyRes.data.trends)
    } catch (error) {
      toast.error('Failed to fetch dashboard data')
      console.error('Dashboard error:', error)
    }
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  // Colors for pie chart
  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280', '#14B8A6', '#F97316']

  // Stat cards data
  const stats = [
    {
      name: 'Today\'s Expenses',
      value: `₹${dashboardData?.today?.amount || 0}`,
      change: `${dashboardData?.today?.count || 0} transactions`,
      icon: DollarSign,
      color: 'blue'
    },
    {
      name: 'This Month',
      value: `₹${dashboardData?.thisMonth?.amount || 0}`,
      change: `${dashboardData?.thisMonth?.count || 0} transactions`,
      icon: Calendar,
      color: 'green'
    },
    {
      name: 'This Year',
      value: `₹${dashboardData?.thisYear?.amount || 0}`,
      change: `${dashboardData?.thisYear?.count || 0} transactions`,
      icon: TrendingUp,
      color: 'purple'
    },
    {
      name: 'Total Expenses',
      value: `₹${dashboardData?.total?.amount || 0}`,
      change: `${dashboardData?.total?.count || 0} transactions`,
      icon: Receipt,
      color: 'orange'
    }
  ]

  // Map category icons for recent expenses
  const categoryIcons = {
    Transportation: Bus,
    Shopping: ShoppingCart,
    Healthcare: HeartPulse,
    Food: Utensils
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600">Overview of your expenses and budget</p>
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <motion.div 
            key={stat.name} 
            className="bg-white rounded-lg shadow-lg hover:shadow-xl transition p-6 cursor-pointer"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            whileHover={{ scale: 1.03 }}
          >
            <div className="flex items-center">
              <div className={`p-2 rounded-lg ${
                stat.color === 'blue' ? 'bg-blue-100' :
                stat.color === 'green' ? 'bg-green-100' :
                stat.color === 'purple' ? 'bg-purple-100' :
                'bg-orange-100'
              }`}>
                <stat.icon className={`w-6 h-6 ${
                  stat.color === 'blue' ? 'text-blue-600' :
                  stat.color === 'green' ? 'text-green-600' :
                  stat.color === 'purple' ? 'text-purple-600' :
                  'text-orange-600'
                }`} />
              </div>
              <div className="ml-4">
                <p className="text-sm font-medium text-gray-600">{stat.name}</p>
                <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
                <p className="text-xs text-gray-500">{stat.change}</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Budget Overview */}
      {budgetData && budgetData.monthlyBudget > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Budget Overview</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <p className="text-sm text-gray-600">Monthly Budget</p>
              <p className="text-2xl font-bold text-gray-900">₹{budgetData.monthlyBudget}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Total Spent</p>
              <p className="text-2xl font-bold text-red-600">₹{budgetData.totalSpent}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-600">Remaining</p>
              <p className={`text-2xl font-bold ${budgetData.remainingBudget >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ₹{Math.abs(budgetData.remainingBudget)}
              </p>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm text-gray-600 mb-2">
              <span>Budget Utilization</span>
              <span>{budgetData.budgetUtilization}%</span>
            </div>
            <motion.div 
              className="w-full bg-gray-200 rounded-full h-2"
              initial={{ width: 0 }}
              animate={{ width: "100%" }}
              transition={{ duration: 0.8 }}
            >
              <div
                className={`h-2 rounded-full ${
                  budgetData.budgetUtilization >= 100 ? 'bg-red-600' :
                  budgetData.budgetUtilization >= 80 ? 'bg-yellow-500' :
                  'bg-green-500'
                }`}
                style={{ width: `${Math.min(budgetData.budgetUtilization, 100)}%` }}
              ></div>
            </motion.div>
          </div>
        </div>
      )}

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Expenses by Category</h2>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ category, percentage }) => `${category}: ${percentage}%`}
                  outerRadius={90}
                  dataKey="amount"
                >
                  {categoryData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No expense data available
            </div>
          )}
        </div>

        {/* Monthly Trends Bar Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Monthly Spending Trends</h2>
          {monthlyData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => [`₹${value}`, 'Amount']} />
                <Bar dataKey="amount" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No monthly data available
            </div>
          )}
        </div>
      </div>

      {/* Recent Expenses */}
      {dashboardData?.recentExpenses && dashboardData.recentExpenses.length > 0 && (
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Recent Expenses</h2>
          <div className="space-y-3">
            {dashboardData.recentExpenses.map((expense) => {
              const Icon = categoryIcons[expense.category] || Receipt
              return (
                <div key={expense._id} className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50 transition">
                  <div className="flex items-center">
                    <Icon className="w-5 h-5 text-gray-500 mr-3" />
                    <div>
                      <p className="font-medium text-gray-900">{expense.description}</p>
                      <p className="text-sm text-gray-600">{expense.category}</p>
                      <p className="text-xs text-gray-500">
                        {new Date(expense.date).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <p className="text-lg font-semibold text-gray-900">₹{expense.amount}</p>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}

export default Dashboard

