const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { createGoal, getGoals, deleteGoal, updateGoal } = require("../controllers/goalController");

router.post("/", protect, createGoal);
router.get("/", protect, getGoals);
router.delete("/:id", protect, deleteGoal);
router.put("/:id", protect, updateGoal);

module.exports = router;