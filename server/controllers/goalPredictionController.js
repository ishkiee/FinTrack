const Goal = require("../models/Goal");
const Income = require("../models/Income");
const Expense = require("../models/Expense");

exports.predictGoalCompletion = async (req, res) => {
    try {
        const userId = req.user.id;
        const goal = await Goal.findById(req.params.id);

        if (!goal) return res.status(404).json({ message: "Goal not found" });
        if (goal.userId.toString() !== userId) return res.status(401).json({ message: "Not authorized" });

        const remaining = goal.targetAmount - goal.currentAmount;

        if (remaining <= 0) {
            return res.status(200).json({
                title: goal.title,
                targetAmount: goal.targetAmount,
                currentAmount: goal.currentAmount,
                remaining: 0,
                status: "✅ Goal already completed!"
            });
        }

        // Calculate average monthly savings over last 3 months
        const now = new Date();
        const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);

        const recentIncome = await Income.find({ userId, date: { $gte: threeMonthsAgo } });
        const recentExpenses = await Expense.find({ userId, date: { $gte: threeMonthsAgo } });

        const totalIncome = recentIncome.reduce((sum, i) => sum + i.amount, 0);
        const totalExpenses = recentExpenses.reduce((sum, e) => sum + e.amount, 0);
        const avgMonthlySavings = Math.round((totalIncome - totalExpenses) / 3);

        if (avgMonthlySavings <= 0) {
            return res.status(200).json({
                title: goal.title,
                targetAmount: goal.targetAmount,
                currentAmount: goal.currentAmount,
                remaining,
                avgMonthlySavings: 0,
                status: "⚠️ No positive savings detected. Unable to predict completion."
            });
        }

        const monthsNeeded = Math.ceil(remaining / avgMonthlySavings);

        // Calculate estimated completion date
        const completionDate = new Date(now.getFullYear(), now.getMonth() + monthsNeeded, 1);
        const monthNames = ["January", "February", "March", "April", "May", "June",
            "July", "August", "September", "October", "November", "December"];
        const estimatedCompletion = `${monthNames[completionDate.getMonth()]} ${completionDate.getFullYear()}`;

        // Check if goal will be met before deadline
        let deadlineStatus = null;
        if (goal.deadline) {
            if (completionDate <= new Date(goal.deadline)) {
                deadlineStatus = `✅ On track to meet deadline`;
            } else {
                deadlineStatus = `⚠️ Predicted to miss deadline by ${Math.ceil((completionDate - new Date(goal.deadline)) / (1000 * 60 * 60 * 24 * 30))} months`;
            }
        }

        res.status(200).json({
            title: goal.title,
            targetAmount: goal.targetAmount,
            currentAmount: goal.currentAmount,
            remaining,
            avgMonthlySavings,
            monthsNeeded,
            estimatedCompletion,
            deadlineStatus
        });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};