const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { addExpense, getExpenses, deleteExpense } = require("../controllers/expenseController");

router.post("/", protect, addExpense);
router.get("/", protect, getExpenses);
router.delete("/:id", protect, deleteExpense);

module.exports = router;