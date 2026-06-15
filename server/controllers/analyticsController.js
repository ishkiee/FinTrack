const Expense = require("../models/Expense");
const Income = require("../models/Income");

exports.getMontlyAnalytics = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();

        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Monthly expenses grouped by day
        const monthlyExpenses = await Expense.aggregate([
            {
                $match: {
                    userId: require("mongoose").Types.ObjectId.createFromHexString(userId),
                    date: { $gte: startOfMonth }
                }
            },
            {
                $group: {
                    _id: { $dayOfMonth: "$date" },
                    total: { $sum: "$amount" }
                }
            },
            { $sort: { _id: 1 } },
            { $project: { day: "$_id", total: 1, _id: 0 } }
        ]);

        // Total this month
        const totalExpenses = monthlyExpenses.reduce((sum, e) => sum + e.total, 0);

        // Total income this month
        const incomes = await Income.find({ userId, date: { $gte: startOfMonth } });
        const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

        // Savings
        const savings = totalIncome - totalExpenses;
        const savingsRate = totalIncome === 0 ? 0 : Math.round((savings / totalIncome) * 100);

        res.status(200).json({
            month: now.toLocaleString("default", { month: "long" }),
            totalExpenses,
            totalIncome,
            savings,
            savingsRate: `${savingsRate}%`,
            dailyBreakdown: monthlyExpenses
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getCategorySpending = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const categorySpending = await Expense.aggregate([
            {
                $match: {
                    userId: require("mongoose").Types.ObjectId.createFromHexString(userId),
                    date: { $gte: startOfMonth }
                }
            },
            { $group: { _id: "$category", total: { $sum: "$amount" } } },
            { $sort: { total: -1 } },
            { $project: { category: "$_id", total: 1, _id: 0 } }
        ]);

        // Highest spending category
        const highest = categorySpending.length > 0 ? categorySpending[0] : null;

        res.status(200).json({
            month: now.toLocaleString("default", { month: "long" }),
            categorySpending,
            highestSpendingCategory: highest ? `${highest.category} (₹${highest.total})` : "No data"
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getSummary = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        const expenses = await Expense.find({ userId, date: { $gte: startOfMonth } });
        const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);

        const incomes = await Income.find({ userId, date: { $gte: startOfMonth } });
        const totalIncome = incomes.reduce((sum, i) => sum + i.amount, 0);

        res.status(200).json({
            totalExpenses,
            totalIncome,
            savings: totalIncome - totalExpenses
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};