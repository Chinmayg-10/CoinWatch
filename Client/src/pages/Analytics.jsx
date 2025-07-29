import { useState, useEffect } from 'react'
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, ResponsiveContainer
} from 'recharts'
import {
  BarChart3, PieChart as PieChartIcon, Calendar, Filter
} from 'lucide-react'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

const Analytics = () => {
  const [categoryData, setCategoryData] = useState([])
  const [monthlyData, setMonthlyData] = useState([])
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    categoryPeriod: 'month',
    monthlyPeriod: 6
  })

  useEffect(() => {
    fetchAnalytics()
  }, [filters])

  const fetchAnalytics = async () => {
    setLoading(true)
    try {
      const [categoryRes, monthlyRes] = await Promise.all([
        api.get(`/analytics/category?period=${filters.categoryPeriod}`),
        api.get(`/analytics/monthly?months=${filters.monthlyPeriod}`)
      ])

      setCategoryData(categoryRes.data)
      setMonthlyData(monthlyRes.data)
    } catch (error) {
      toast.error('Failed to fetch analytics data')
      console.error('Analytics error:', error)
    }
    setLoading(false)
  }

  // Chart colors
  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280', '#14B8A6', '#F97316']

  // Custom Tooltips
  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{label}</p>
          <p className="text-sm text-blue-600">Amount: ₹{payload[0].value}</p>
          {payload[0].payload.count && (
            <p className="text-sm text-gray-600">Transactions: {payload[0].payload.count}</p>
          )}
        </div>
      )
    }
    return null
  }

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900">{data.payload.category}</p>
          <p className="text-sm text-blue-600">Amount: ₹{data.value}</p>
          <p className="text-sm text-gray-600">Percentage: {data.payload.percentage}%</p>
          <p className="text-sm text-gray-600">Transactions: {data.payload.count}</p>
        </div>
      )
    }
    return null
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="space-y-8 p-6 bg-gradient-to-br from-blue-50 to-purple-50 rounded-xl">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900">📊 Analytics Dashboard</h1>
        <p className="text-gray-600 text-sm">Get deep insights into your expenses</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-blue-100">
              <PieChartIcon className="w-7 h-7 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Categories</p>
              <p className="text-2xl font-bold text-gray-900">{categoryData.categories?.length || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-green-100">
              <BarChart3 className="w-7 h-7 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Period Total</p>
              <p className="text-2xl font-bold text-gray-900">₹{categoryData.totalExpenses || 0}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all">
          <div className="flex items-center space-x-4">
            <div className="p-3 rounded-full bg-purple-100">
              <Calendar className="w-7 h-7 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Average Monthly</p>
              <p className="text-2xl font-bold text-gray-900">
                ₹{monthlyData.trends?.length > 0
                  ? Math.round((monthlyData.trends.reduce((s, m) => s + m.amount, 0) / monthlyData.trends.length) * 100) / 100
                  : 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white shadow-md rounded-2xl px-6 py-4 flex flex-wrap items-center gap-4">
        <Filter className="w-5 h-5 text-gray-500" />
        <span className="text-gray-700 font-medium">Filters</span>

        {/* Category Period Buttons */}
        <div className="flex gap-2">
          {['week', 'month', 'year'].map((period) => (
            <button
              key={period}
              onClick={() => setFilters((prev) => ({ ...prev, categoryPeriod: period }))}
              className={`px-4 py-2 rounded-full text-sm font-medium 
                ${filters.categoryPeriod === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              {period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'This Year'}
            </button>
          ))}
        </div>

        {/* Monthly Period Select */}
        <select
          value={filters.monthlyPeriod}
          onChange={(e) => setFilters((prev) => ({ ...prev, monthlyPeriod: parseInt(e.target.value) }))}
          className="ml-auto px-3 py-2 text-sm border border-gray-300 rounded-full focus:outline-none"
        >
          <option value={3}>Last 3 months</option>
          <option value={6}>Last 6 months</option>
          <option value={12}>Last 12 months</option>
        </select>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Expenses by Category
          </h2>
          {categoryData.categories?.length > 0 ? (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={categoryData.categories}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    outerRadius={90}
                    fill="#8884d8"
                    dataKey="amount"
                  >
                    {categoryData.categories.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              {/* Legends */}
              <div className="grid grid-cols-1 gap-2">
                {categoryData.categories.map((category, index) => (
                  <div key={category.category} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                      <span className="text-gray-700">{category.category}</span>
                    </div>
                    <div className="flex space-x-4 text-gray-600">
                      <span>₹{category.amount}</span>
                      <span>({category.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500">
              No category data available for this period
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Monthly Spending Trends
          </h2>
          {monthlyData.trends?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData.trends}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" tick={{ fontSize: 12 }} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip content={<CustomTooltip />} />
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

      {/* Tables */}
      {categoryData.categories?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Category Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Category</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Total Amount</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Percentage</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Transactions</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Average</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {categoryData.categories
                  .sort((a, b) => b.amount - a.amount)
                  .map((category, index) => (
                    <tr key={category.category} className="hover:bg-gray-50">
                      <td className="px-6 py-4 flex items-center">
                        <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: COLORS[index % COLORS.length] }}></div>
                        {category.category}
                      </td>
                      <td className="px-6 py-4">₹{category.amount}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 rounded-full h-2 mr-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${category.percentage}%` }}></div>
                          </div>
                          {category.percentage}%
                        </div>
                      </td>
                      <td className="px-6 py-4">{category.count}</td>
                      <td className="px-6 py-4">₹{category.avgAmount}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {monthlyData.trends?.length > 0 && (
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Monthly Trends Details</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Month</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Total Amount</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Transactions</th>
                  <th className="px-6 py-3 text-left font-medium text-gray-500 uppercase">Average</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-100">
                {monthlyData.trends.map((month) => (
                  <tr key={`${month.year}-${month.monthNum}`} className="hover:bg-gray-50">
                    <td className="px-6 py-4">{month.month}</td>
                    <td className="px-6 py-4">₹{month.amount}</td>
                    <td className="px-6 py-4">{month.count}</td>
                    <td className="px-6 py-4">₹{month.avgAmount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default Analytics
