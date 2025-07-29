const express = require('express');
const { body, validationResult } = require('express-validator');
const User = require('../models/user');
const Expense = require('../models/expense');
const auth = require('../middleware/auth');

const router = express.Router();
router.get('/', auth, async (req, res) => {
  try {
    const user = req.user;
    const currentDate = new Date();
    const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1);
    const lastDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0);

    const monthlyExpenses = await Expense.aggregate([
      {
        $match: {
          user: user._id,
          date: { $gte: firstDayOfMonth, $lte: lastDayOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: '$amount' }
        }
      }
    ]);

    const totalSpent = monthlyExpenses.length > 0 ? monthlyExpenses[0].totalSpent : 0;
    const remainingBudget = user.monthlyBudget - totalSpent;
    const budgetUtilization = user.monthlyBudget > 0 ? (totalSpent / user.monthlyBudget) * 100 : 0;
    let alert = null;
    if (budgetUtilization >= 100) {
      alert = { type: 'danger', message: 'Budget exceeded! You have overspent this month.' };
    } else if (budgetUtilization >= 80) {
      alert = { type: 'warning', message: 'Warning: You have used 80% of your monthly budget.' };
    } else if (budgetUtilization >= 60) {
      alert = { type: 'info', message: 'You have used 60% of your monthly budget.' };
    }

    res.json({
      monthlyBudget: user.monthlyBudget,
      totalSpent,
      remainingBudget,
      budgetUtilization: Math.round(budgetUtilization * 100) / 100,
      alert
    });
  } catch (error) {
    console.error('Get budget error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});


router.put('/', [
  auth,
  body('monthlyBudget').isFloat({ min: 0 }).withMessage('Budget must be a positive number')
], async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { monthlyBudget } = req.body;

    const user = await User.findByIdAndUpdate(
      req.user._id,
      { monthlyBudget },
      { new: true, runValidators: true }
    );

    res.json({
      message: 'Budget updated successfully',
      monthlyBudget: user.monthlyBudget
    });
  } catch (error) {
    console.error('Update budget error:', error);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router;