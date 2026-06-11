const Goal = require("../models/Goal");

exports.createGoal = async (req, res) => {
    const { title, targetAmount, currentAmount, deadline } = req.body;
    try {
        const goal = await Goal.create({
            userId: req.user.id,
            title,
            targetAmount,
            currentAmount,
            deadline
        });
        res.status(201).json(goal);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.getGoals = async (req, res) => {
    try {
        const goals = await Goal.find({ userId: req.user.id }).sort({ deadline: 1 });
        res.status(200).json(goals);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.deleteGoal = async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);
        if (!goal) return res.status(404).json({ message: "Goal not found" });
        if (goal.userId.toString() !== req.user.id) return res.status(401).json({ message: "Not authorized" });

        await goal.deleteOne();
        res.status(200).json({ message: "Goal deleted" });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};

exports.updateGoal = async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);
        if (!goal) return res.status(404).json({ message: "Goal not found" });
        if (goal.userId.toString() !== req.user.id) return res.status(401).json({ message: "Not authorized" });

        const { currentAmount } = req.body;
        goal.currentAmount = currentAmount;
        await goal.save();

        res.status(200).json(goal);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
};