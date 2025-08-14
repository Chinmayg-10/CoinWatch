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

  const COLORS = ['#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899', '#6B7280', '#14B8A6', '#F97316']

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{label}</p>
          <p className="text-sm text-blue-600 dark:text-blue-400">Amount: ₹{payload[0].value}</p>
          {payload[0].payload.count && (
            <p className="text-sm text-gray-600 dark:text-gray-400">Transactions: {payload[0].payload.count}</p>
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
        <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
          <p className="text-sm font-medium text-gray-900 dark:text-gray-100">{data.payload.category}</p>
          <p className="text-sm text-blue-600 dark:text-blue-400">Amount: ₹{data.value}</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Percentage: {data.payload.percentage}%</p>
          <p className="text-sm text-gray-600 dark:text-gray-400">Transactions: {data.payload.count}</p>
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
    <div className="space-y-8 p-6 bg-gradient-to-br from-gray-900 to-gray-800 dark:from-gray-900 dark:to-gray-800 rounded-xl">
      {/* Header */}
      <div className="text-center mb-10">
        <h1 className="text-3xl font-extrabold text-gray-900 dark:text-white">📊 Analytics Dashboard</h1>
        <p className="text-gray-600 dark:text-gray-400 text-sm">Get deep insights into your expenses</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          {
            icon: <PieChartIcon className="w-7 h-7 text-blue-600 dark:text-blue-400" />,
            label: 'Total Categories',
            value: categoryData.categories?.length || 0,
            bg: 'bg-blue-100 dark:bg-blue-900/30'
          },
          {
            icon: <BarChart3 className="w-7 h-7 text-green-600 dark:text-green-400" />,
            label: 'Period Total',
            value: `₹${categoryData.totalExpenses || 0}`,
            bg: 'bg-green-100 dark:bg-green-900/30'
          },
          {
            icon: <Calendar className="w-7 h-7 text-purple-600 dark:text-purple-400" />,
            label: 'Average Monthly',
            value: `₹${
              monthlyData.trends?.length > 0
                ? Math.round((monthlyData.trends.reduce((s, m) => s + m.amount, 0) / monthlyData.trends.length) * 100) / 100
                : 0
            }`,
            bg: 'bg-purple-100 dark:bg-purple-900/30'
          }
        ].map((card, idx) => (
          <div key={idx} className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 transform hover:scale-105 transition-all">
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${card.bg}`}>
                {card.icon}
              </div>
              <div>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.label}</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">{card.value}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Filter Bar */}
      <div className="bg-white dark:bg-gray-800 shadow-md rounded-2xl px-6 py-4 flex flex-wrap items-center gap-4">
        <Filter className="w-5 h-5 text-gray-500 dark:text-gray-400" />
        <span className="text-gray-700 dark:text-gray-300 font-medium">Filters</span>

        <div className="flex gap-2">
          {['week', 'month', 'year'].map((period) => (
            <button
              key={period}
              onClick={() => setFilters((prev) => ({ ...prev, categoryPeriod: period }))}
              className={`px-4 py-2 rounded-full text-sm font-medium transition-colors
                ${filters.categoryPeriod === period
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'}`}
            >
              {period === 'week' ? 'This Week' : period === 'month' ? 'This Month' : 'This Year'}
            </button>
          ))}
        </div>

        <select
          value={filters.monthlyPeriod}
          onChange={(e) => setFilters((prev) => ({ ...prev, monthlyPeriod: parseInt(e.target.value) }))}
          className="ml-auto px-3 py-2 text-sm border border-gray-300 dark:border-gray-600 rounded-full bg-white dark:bg-gray-700 text-gray-900 dark:text-gray-200 focus:outline-none"
        >
          <option value={3}>Last 3 months</option>
          <option value={6}>Last 6 months</option>
          <option value={12}>Last 12 months</option>
        </select>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Category Pie Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Expenses by Category</h2>
          {categoryData.categories?.length > 0 ? (
            <div className="space-y-4">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie data={categoryData.categories} cx="50%" cy="50%" outerRadius={90} dataKey="amount">
                    {categoryData.categories.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <div className="grid grid-cols-1 gap-2">
                {categoryData.categories.map((cat, i) => (
                  <div key={cat.category} className="flex items-center justify-between text-sm">
                    <div className="flex items-center">
                      <div className="w-3 h-3 rounded-full mr-2" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                      <span className="text-gray-700 dark:text-gray-300">{cat.category}</span>
                    </div>
                    <div className="flex space-x-4 text-gray-600 dark:text-gray-400">
                      <span>₹{cat.amount}</span>
                      <span>({cat.percentage}%)</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              No category data available for this period
            </div>
          )}
        </div>

        {/* Monthly Bar Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Monthly Spending Trends</h2>
          {monthlyData.trends?.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData.trends}>
                <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.2} />
                <XAxis dataKey="month" tick={{ fontSize: 12, fill: '#9CA3AF' }} angle={-45} textAnchor="end" height={60} />
                <YAxis tick={{ fontSize: 12, fill: '#9CA3AF' }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="amount" fill="#3B82F6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-64 text-gray-500 dark:text-gray-400">
              No monthly data available
            </div>
          )}
        </div>
      </div>

      {/* Tables */}
      {categoryData.categories?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Category Breakdown</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {['Category', 'Total Amount', 'Percentage', 'Transactions', 'Average'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-300 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                {categoryData.categories
                  .sort((a, b) => b.amount - a.amount)
                  .map((cat, i) => (
                    <tr key={cat.category} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 flex items-center">
                        <div className="w-3 h-3 rounded-full mr-3" style={{ backgroundColor: COLORS[i % COLORS.length] }}></div>
                        {cat.category}
                      </td>
                      <td className="px-6 py-4">₹{cat.amount}</td>
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2 mr-2">
                            <div className="bg-blue-600 h-2 rounded-full" style={{ width: `${cat.percentage}%` }}></div>
                          </div>
                          {cat.percentage}%
                        </div>
                      </td>
                      <td className="px-6 py-4">{cat.count}</td>
                      <td className="px-6 py-4">₹{cat.avgAmount}</td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {monthlyData.trends?.length > 0 && (
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Monthly Trends Details</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  {['Month', 'Total Amount', 'Transactions', 'Average'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left font-medium text-gray-500 dark:text-gray-300 uppercase">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-100 dark:divide-gray-700">
                {monthlyData.trends.map((m) => (
                  <tr key={`${m.year}-${m.monthNum}`} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4">{m.month}</td>
                    <td className="px-6 py-4">₹{m.amount}</td>
                    <td className="px-6 py-4">{m.count}</td>
                    <td className="px-6 py-4">₹{m.avgAmount}</td>
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


