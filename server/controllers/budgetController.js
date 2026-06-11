const Budget = require("../models/Budget");

exports.createBudget = async (req, res) => {
    const { category, monthlyLimit } = req.body;
    try {
        const budget = await Budget.create({
            userId: req.user.id,
            category,
            monthlyLimit
        });
        res.status(201).json(budget);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getBudgets = async (req, res) => {
    try {
        const budgets = await Budget.find({ userId: req.user.id });
        res.status(200).json(budgets);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateBudget = async (req, res) => {
    try {
        const budget = await Budget.findById(req.params.id);
        if (!budget) return res.status(404).json({ message: "Budget not found" });
        if (budget.userId.toString() !== req.user.id) return res.status(401).json({ message: "Not authorized" });

        const { monthlyLimit } = req.body;
        budget.monthlyLimit = monthlyLimit;
        await budget.save();

        res.status(200).json(budget);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteBudget = async (req, res) => {
    try {
        const budget = await Budget.findById(req.params.id);
        if (!budget) return res.status(404).json({ message: "Budget not found" });
        if (budget.userId.toString() !== req.user.id) return res.status(401).json({ message: "Not authorized" });

        await budget.deleteOne();
        res.status(200).json({ message: "Budget deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};