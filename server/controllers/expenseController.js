const Expense = require("../models/Expense");

exports.addExpense = async (req, res) => {
    const { amount, category, description, date } = req.body;
    try {
        const expense = await Expense.create({
            userId: req.user.id,
            amount,
            category,
            description,
            date
        });
        res.status(201).json(expense);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getExpenses = async (req, res) => {
    try {
        const expenses = await Expense.find({ userId: req.user.id }).sort({ date: -1 });
        res.status(200).json(expenses);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteExpense = async (req, res) => {
    try {
        const expense = await Expense.findById(req.params.id);
        if (!expense) return res.status(404).json({ message: "Expense not found" });
        if (expense.userId.toString() !== req.user.id) return res.status(401).json({ message: "Not authorized" });

        await expense.deleteOne();
        res.status(200).json({ message: "Expense deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};