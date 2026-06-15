const Expense = require("../models/Expense");
const Income = require("../models/Income");
const Goal = require("../models/Goal");
const Budget = require("../models/Budget");

exports.getDashboard = async (req, res) => {
    try {
        const userId = req.user.id;
        const now = new Date();

        // Month names
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
        const thisMonthName = monthNames[now.getMonth()];
        const lastMonthName = monthNames[now.getMonth() - 1 < 0 ? 11 : now.getMonth() - 1];

        // This month range
        const startOfThisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        // Expenses
        const thisMonthExpenses = await Expense.find({ userId, date: { $gte: startOfThisMonth } });
        const lastMonthExpenses = await Expense.find({ userId, date: { $gte: startOfLastMonth, $lte: endOfLastMonth } });

        const totalThisMonthExpenses = thisMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
        const totalLastMonthExpenses = lastMonthExpenses.reduce((sum, e) => sum + e.amount, 0);
        const expenseChange = totalLastMonthExpenses === 0 ? null :
            Math.round(((totalThisMonthExpenses - totalLastMonthExpenses) / totalLastMonthExpenses) * 100);

        // Income
        const thisMonthIncome = await Income.find({ userId, date: { $gte: startOfThisMonth } });
        const lastMonthIncome = await Income.find({ userId, date: { $gte: startOfLastMonth, $lte: endOfLastMonth } });

        const totalThisMonthIncome = thisMonthIncome.reduce((sum, i) => sum + i.amount, 0);
        const totalLastMonthIncome = lastMonthIncome.reduce((sum, i) => sum + i.amount, 0);
        const incomeChange = totalLastMonthIncome === 0 ? null :
            Math.round(((totalThisMonthIncome - totalLastMonthIncome) / totalLastMonthIncome) * 100);

        // Savings
        const thisMonthSavings = totalThisMonthIncome - totalThisMonthExpenses;
        const savingsRate = totalThisMonthIncome === 0 ? 0 :
            Math.round((thisMonthSavings / totalThisMonthIncome) * 100);

        // Goals
        const goals = await Goal.find({ userId });
        const completedGoals = goals.filter(g => g.currentAmount >= g.targetAmount).length;
        const activeGoals = goals.filter(g => g.currentAmount < g.targetAmount).length;

        // Budgets + Breach Alerts
        const budgets = await Budget.find({ userId });
        const totalBudget = budgets.reduce((sum, b) => sum + b.monthlyLimit, 0);
        const totalSpent = totalThisMonthExpenses;
        const remaining = totalBudget - totalSpent;

        const breachAlerts = [];
        for (const budget of budgets) {
            const categorySpent = thisMonthExpenses
                .filter(e => e.category.toLowerCase() === budget.category.toLowerCase())
                .reduce((sum, e) => sum + e.amount, 0);

            const percentage = Math.round((categorySpent / budget.monthlyLimit) * 100);
            let alertLevel = null;
            if (percentage >= 100) alertLevel = "🔴 EXCEEDED";
            else if (percentage >= 90) alertLevel = "🟠 90% Warning";
            else if (percentage >= 80) alertLevel = "🟡 80% Warning";

            if (alertLevel) {
                breachAlerts.push({
                    category: budget.category,
                    monthlyLimit: budget.monthlyLimit,
                    spent: categorySpent,
                    percentage,
                    alert: alertLevel
                });
            }
        }

        // Insights
        const insights = [];

        if (expenseChange !== null) {
            if (expenseChange > 0) insights.push(`⚠️ Expenses up ${expenseChange}% vs ${lastMonthName}`);
            else if (expenseChange < 0) insights.push(`✅ Expenses down ${Math.abs(expenseChange)}% vs ${lastMonthName}`);
            else insights.push(`➡️ Expenses same as ${lastMonthName}`);
        }

        if (savingsRate >= 20) insights.push(`✅ You saved ${savingsRate}% of your income this month`);
        else if (totalThisMonthIncome > 0) insights.push(`⚠️ Low savings rate: ${savingsRate}% this month`);

        if (incomeChange !== null && incomeChange > 0) insights.push(`📈 Income up ${incomeChange}% vs ${lastMonthName}`);

        breachAlerts.forEach(alert => {
            insights.push(`${alert.alert} ${alert.category} budget at ${alert.percentage}%`);
        });

        if (activeGoals > 0) insights.push(`🎯 You have ${activeGoals} active goal${activeGoals > 1 ? "s" : ""} in progress`);

        res.status(200).json({
            expenses: {
                thisMonth: totalThisMonthExpenses,
                lastMonth: totalLastMonthExpenses,
                change: expenseChange !== null ? `${expenseChange > 0 ? "+" : ""}${expenseChange}% vs ${lastMonthName}` : `No data for ${lastMonthName}`
            },
            income: {
                thisMonth: totalThisMonthIncome,
                lastMonth: totalLastMonthIncome,
                change: incomeChange !== null ? `${incomeChange > 0 ? "+" : ""}${incomeChange}% vs ${lastMonthName}` : `No data for ${lastMonthName}`
            },
            savings: {
                thisMonth: thisMonthSavings,
                savingsRate: `${savingsRate}%`
            },
            goals: {
                total: goals.length,
                completed: completedGoals,
                active: activeGoals
            },
            budgets: {
                total: totalBudget,
                spent: totalSpent,
                remaining,
                breachAlerts
            },
            insights
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};