const express = require('express');
const Expense = require('../models/expense');
const auth = require('../middleware/auth');

const router = express.Router();
router.get('/category', auth, async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    const currentDate = new Date();
    let startDate;

    switch (period) {
      case 'week':
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - 7);
        break;
      case 'year':
        startDate = new Date(currentDate.getFullYear(), 0, 1);
        break;
      case 'month':
      default:
        startDate = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
        break;
    }

    const categoryAnalytics = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lte: currentDate }
        }
      },
      {
        $group: {
          _id: '$category',
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      },
      {
        $sort: { totalAmount: -1 }
      }
    ]);
    const totalExpenses = categoryAnalytics.reduce((sum, cat) => sum + cat.totalAmount, 0);

    const categoryData = categoryAnalytics.map(cat => ({
      category: cat._id,
      amount: Math.round(cat.totalAmount * 100) / 100,
      count: cat.count,
      avgAmount: Math.round(cat.avgAmount * 100) / 100,
      percentage: totalExpenses > 0 ? Math.round((cat.totalAmount / totalExpenses) * 100 * 100) / 100 : 0
    }));

    res.json({
      period,
      totalExpenses: Math.round(totalExpenses * 100) / 100,
      categories: categoryData
    });
  } catch (error) {
    console.error('Category analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/monthly', auth, async (req, res) => {
  try {
    const { months = 6 } = req.query;
    const currentDate = new Date();
    const startDate = new Date(currentDate);
    startDate.setMonth(currentDate.getMonth() - parseInt(months));
    startDate.setDate(1);

    const monthlyTrends = await Expense.aggregate([
      {
        $match: {
          user: req.user._id,
          date: { $gte: startDate, $lte: currentDate }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$date' },
            month: { $month: '$date' }
          },
          totalAmount: { $sum: '$amount' },
          count: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    const monthNames = [
      'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
    ];

    const trendsData = monthlyTrends.map(trend => ({
      month: `${monthNames[trend._id.month - 1]} ${trend._id.year}`,
      year: trend._id.year,
      monthNum: trend._id.month,
      amount: Math.round(trend.totalAmount * 100) / 100,
      count: trend.count,
      avgAmount: Math.round(trend.avgAmount * 100) / 100
    }));

    res.json({
      months: parseInt(months),
      trends: trendsData
    });
  } catch (error) {
    console.error('Monthly trends error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

router.get('/dashboard', auth, async (req, res) => {
  try {
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const firstDayOfYear = new Date(currentDate.getFullYear(), 0, 1);
    const [
      todayExpenses,
      monthlyExpenses,
      yearlyExpenses,
      totalExpenses,
      recentExpenses
    ] = await Promise.all([
      Expense.aggregate([
        {
          $match: {
            user: req.user._id,
            date: {
              $gte: new Date(currentDate.setHours(0, 0, 0, 0)),
              $lte: new Date(currentDate.setHours(23, 59, 59, 999))
            }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      Expense.aggregate([
        {
          $match: {
            user: req.user._id,
            date: { $gte: firstDayOfMonth, $lte: currentDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      Expense.aggregate([
        {
          $match: {
            user: req.user._id,
            date: { $gte: firstDayOfYear, $lte: currentDate }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      Expense.aggregate([
        {
          $match: { user: req.user._id }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' },
            count: { $sum: 1 }
          }
        }
      ]),
      Expense.find({ user: req.user._id })
        .sort({ date: -1 })
        .limit(5)
        .select('amount category description date')
    ]);

    const dashboard = {
      today: {
        amount: todayExpenses.length > 0 ? Math.round(todayExpenses[0].total * 100) / 100 : 0,
        count: todayExpenses.length > 0 ? todayExpenses[0].count : 0
      },
      thisMonth: {
        amount: monthlyExpenses.length > 0 ? Math.round(monthlyExpenses[0].total * 100) / 100 : 0,
        count: monthlyExpenses.length > 0 ? monthlyExpenses[0].count : 0
      },
      thisYear: {
        amount: yearlyExpenses.length > 0 ? Math.round(yearlyExpenses[0].total * 100) / 100 : 0,
        count: yearlyExpenses.length > 0 ? yearlyExpenses[0].count : 0
      },
      total: {
        amount: totalExpenses.length > 0 ? Math.round(totalExpenses[0].total * 100) / 100 : 0,
        count: totalExpenses.length > 0 ? totalExpenses[0].count : 0
      },
      recentExpenses: recentExpenses.map(expense => ({
        ...expense.toObject(),
        amount: Math.round(expense.amount * 100) / 100
      }))
    };

    res.json(dashboard);
  } catch (error) {
    console.error('Dashboard analytics error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;