const Income = require("../models/Income");

exports.addIncome = async (req, res) => {
    const { amount, source, description, date } = req.body;
    try {
        const income = await Income.create({
            userId: req.user.id,
            amount,
            source,
            description,
            date
        });
        res.status(201).json(income);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getIncomes = async (req, res) => {
    try {
        const incomes = await Income.find({ userId: req.user.id }).sort({ date: -1 });
        res.status(200).json(incomes);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateIncome = async (req, res) => {
    try {
        const income = await Income.findById(req.params.id);
        if (!income) return res.status(404).json({ message: "Income not found" });
        if (income.userId.toString() !== req.user.id) return res.status(401).json({ message: "Not authorized" });

        const { amount, source, description, date } = req.body;
        if (amount) income.amount = amount;
        if (source) income.source = source;
        if (description) income.description = description;
        if (date) income.date = date;

        await income.save();
        res.status(200).json(income);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteIncome = async (req, res) => {
    try {
        const income = await Income.findById(req.params.id);
        if (!income) return res.status(404).json({ message: "Income not found" });
        if (income.userId.toString() !== req.user.id) return res.status(401).json({ message: "Not authorized" });

        await income.deleteOne();
        res.status(200).json({ message: "Income deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};