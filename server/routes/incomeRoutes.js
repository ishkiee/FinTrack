const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { addIncome, getIncomes, updateIncome, deleteIncome } = require("../controllers/incomeController");

router.post("/", protect, addIncome);
router.get("/", protect, getIncomes);
router.put("/:id", protect, updateIncome);
router.delete("/:id", protect, deleteIncome);

module.exports = router;