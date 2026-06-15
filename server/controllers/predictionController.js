const Expense = require("../models/Expense");
const Budget = require("../models/Budget");

exports.getBudgetPrediction = async (req, res) => {
    try {
        const userId = req.user.id;

        // Get current date info
        const now = new Date();
        const currentDay = now.getDate();
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();

        // Get expenses for current month
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const expenses = await Expense.find({
            userId,
            date: { $gte: startOfMonth }
        });

        const currentSpending = expenses.reduce((sum, e) => sum + e.amount, 0);

        // Predict end of month spending
        const dailyAverage = currentSpending / currentDay;
        const predictedSpending = Math.round(dailyAverage * daysInMonth);

        // Get all budgets
        const budgets = await Budget.find({ userId });
        const totalBudget = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);

        // Budget breach alerts per category
        const alerts = [];
        for (const budget of budgets) {
            const categoryExpenses = expenses
                .filter(e => e.category.toLowerCase() === budget.category.toLowerCase())
                .reduce((sum, e) => sum + e.amount, 0);

            const percentage = Math.round((categoryExpenses / budget.monthlyLimit) * 100);

            let alertLevel = null;
            if (percentage >= 100) alertLevel = "🔴 EXCEEDED";
            else if (percentage >= 90) alertLevel = "🟠 90% Warning";
            else if (percentage >= 80) alertLevel = "🟡 80% Warning";

            if (alertLevel) {
                alerts.push({
                    category: budget.category,
                    monthlyLimit: budget.monthlyLimit,
                    currentSpending: categoryExpenses,
                    percentage,
                    alert: alertLevel
                });
            }
        }

        // Warning message
        let warning = null;
        if (predictedSpending > totalBudget) {
            warning = `⚠️ You are on track to overspend by ₹${predictedSpending - totalBudget} this month`;
        } else {
            warning = `✅ You are on track. Predicted spending is ₹${predictedSpending} out of ₹${totalBudget} budget`;
        }

        res.status(200).json({
            currentDay,
            daysInMonth,
            currentSpending,
            predictedSpending,
            totalBudget,
            warning,
            alerts
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};