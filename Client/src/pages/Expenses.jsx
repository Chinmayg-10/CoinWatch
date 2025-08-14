import { useState, useEffect, React } from 'react'
import { Plus, Edit, Trash2, Search, Utensils, Bus, ShoppingCart, Film, CreditCard, HeartPulse, Book, Globe, Circle } from 'lucide-react'
import api from '../services/api'
import LoadingSpinner from '../components/LoadingSpinner'
import toast from 'react-hot-toast'

// Categories
const categories = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Education',
  'Travel',
  'Other'
]

// Icons for categories
const categoryIcons = {
  'Food & Dining': Utensils,
  'Transportation': Bus,
  'Shopping': ShoppingCart,
  'Entertainment': Film,
  'Bills & Utilities': CreditCard,
  'Healthcare': HeartPulse,
  'Education': Book,
  'Travel': Globe,
  'Other': Circle
}

// Badge colors for categories
const categoryColors = {
  'Food & Dining': 'bg-red-800 text-red-100',
  Transportation: 'bg-blue-800 text-blue-100',
  Shopping: 'bg-green-800 text-green-100',
  Entertainment: 'bg-purple-800 text-purple-100',
  'Bills & Utilities': 'bg-yellow-800 text-yellow-100',
  Healthcare: 'bg-teal-800 text-teal-100',
  Education: 'bg-indigo-800 text-indigo-100',
  Travel: 'bg-pink-800 text-pink-100',
  Other: 'bg-gray-700 text-gray-100'
}

// Expense Form Modal
const ExpenseForm = ({ expense, onSave, onCancel }) => {
  const [formData, setFormData] = useState({
    amount: expense?.amount || '',
    category: expense?.category || '',
    description: expense?.description || '',
    date: expense?.date ? new Date(expense.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0]
  })
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    try {
      if (expense) {
        await api.put(`/expenses/${expense._id}`, formData)
        toast.success('Expense updated successfully')
      } else {
        await api.post('/expenses', formData)
        toast.success('Expense added successfully')
      }
      onSave()
    } catch (error) {
      toast.error('Failed to save expense')
      console.error(error)
    }
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md shadow-lg text-gray-100">
        <h2 className="text-xl font-semibold mb-4">{expense ? 'Edit Expense' : 'Add New Expense'}</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Amount (₹)</label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              required
              autoFocus
              value={formData.amount}
              onChange={(e) => setFormData(prev => ({ ...prev, amount: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="0.00"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Category</label>
            <select
              required
              value={formData.category}
              onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="">Select a category</option>
              {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <input
              type="text"
              maxLength={200}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
              placeholder="What did you spend on?"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Date</label>
            <input
              type="date"
              required
              value={formData.date}
              onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
              className="w-full px-3 py-2 border border-gray-700 rounded-lg bg-gray-800 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="submit"
              disabled={loading}
              className="flex-1 bg-primary-600 text-white py-2 px-4 rounded-lg hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:opacity-50"
            >
              {loading ? <LoadingSpinner size="sm" /> : (expense ? 'Update' : 'Add Expense')}
            </button>
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 bg-gray-700 text-gray-200 py-2 px-4 rounded-lg hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-gray-500"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

// Main Expenses Component
const Expenses = () => {
  const [expenses, setExpenses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [editingExpense, setEditingExpense] = useState(null)
  const [filters, setFilters] = useState({ category: 'all', startDate: '', endDate: '' })
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    fetchExpenses()
  }, [filters])

  const fetchExpenses = async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({
        ...(filters.category !== 'all' && { category: filters.category }),
        ...(filters.startDate && { startDate: filters.startDate }),
        ...(filters.endDate && { endDate: filters.endDate })
      })
      const res = await api.get(`/expenses?${params}`)
      setExpenses(res.data.expenses)
    } catch (error) {
      toast.error('Failed to fetch expenses')
      console.error(error)
    }
    setLoading(false)
  }

  const handleAddExpense = () => { setEditingExpense(null); setShowForm(true) }
  const handleEditExpense = (expense) => { setEditingExpense(expense); setShowForm(true) }
  const handleDeleteExpense = async (id) => {
    if (!window.confirm('Are you sure?')) return
    try {
      await api.delete(`/expenses/${id}`)
      setExpenses(prev => prev.filter(e => e._id !== id))
      toast.success('Expense deleted')
    } catch (error) {
      toast.error('Failed to delete expense')
      console.error(error)
    }
  }
  const handleFormSave = () => { setShowForm(false); fetchExpenses() }
  const handleFormCancel = () => { setShowForm(false) }
  const handleFilterChange = (key, value) => setFilters(prev => ({ ...prev, [key]: value }))
  const clearFilters = () => { setFilters({ category: 'all', startDate: '', endDate: '' }); setSearchTerm('') }

  const filteredExpenses = expenses.filter(expense =>
    (expense.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
     expense.category.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  return (
    <div className="space-y-6 text-gray-100">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold">Expenses</h1>
          <p className="text-gray-400">Track and manage your expenses smartly</p>
        </div>
        <button onClick={handleAddExpense} className="bg-primary-600 text-white px-4 py-2 rounded-lg hover:bg-primary-700 flex items-center space-x-2">
          <Plus className="w-5 h-5" /><span>Add Expense</span>
        </button>
      </div>

      {/* Filters */}
      <div className="bg-gray-800 rounded-lg shadow p-6 flex flex-col md:flex-row md:items-center md:space-x-4 space-y-2 md:space-y-0">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            placeholder="Search expenses..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 w-full border border-gray-700 rounded-lg bg-gray-900 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
          />
        </div>
        <select
          value={filters.category}
          onChange={e => handleFilterChange('category', e.target.value)}
          className="px-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500"
        >
          <option value="all">All Categories</option>
          {categories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
        </select>
        <input type="date" value={filters.startDate} onChange={e => handleFilterChange('startDate', e.target.value)}
          className="px-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500" />
        <input type="date" value={filters.endDate} onChange={e => handleFilterChange('endDate', e.target.value)}
          className="px-3 py-2 border border-gray-700 rounded-lg bg-gray-900 text-gray-100 focus:outline-none focus:ring-2 focus:ring-primary-500" />
        <button onClick={clearFilters} className="text-primary-400 hover:text-primary-300 text-sm font-medium">Clear Filters</button>
      </div>

      {/* Table */}
      <div className="bg-gray-900 rounded-lg shadow overflow-x-auto">
        {loading ? (
          <div className="flex items-center justify-center h-64"><LoadingSpinner size="lg" /></div>
        ) : filteredExpenses.length === 0 ? (
          <div className="text-center py-12 text-gray-500 text-lg">No expenses found</div>
        ) : (
          <table className="min-w-full divide-y divide-gray-700">
            <thead className="bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Description</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Amount</th>
                <th className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {filteredExpenses.map(exp => (
                <tr key={exp._id} className="hover:bg-gray-800 transition">
                  <td className="px-6 py-4 whitespace-nowrap text-sm">{new Date(exp.date).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' })}</td>
                  <td className="px-6 py-4 text-sm">{exp.description || '-'}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
  <div className="flex items-center space-x-2">
    {(() => {
      const Icon = categoryIcons[exp.category] || categoryIcons['Other'];
      return Icon ? <Icon className="w-5 h-5 text-gray-400" /> : null;
    })()}
    <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${categoryColors[exp.category] || 'bg-gray-700 text-gray-100'}`}>
      {exp.category || 'Other'}
    </span>
  </div>
</td>

                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">₹{exp.amount}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium flex space-x-2">
                    <button onClick={() => handleEditExpense(exp)} className="text-primary-400 hover:text-primary-300"><Edit className="w-4 h-4" /></button>
                    <button onClick={() => handleDeleteExpense(exp._id)} className="text-red-500 hover:text-red-400"><Trash2 className="w-4 h-4" /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Form Modal */}
      {showForm && <ExpenseForm expense={editingExpense} onSave={handleFormSave} onCancel={handleFormCancel} />}
    </div>
  )
}

export default Expenses



