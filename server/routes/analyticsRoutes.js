const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getMontlyAnalytics, getCategorySpending, getSummary } = require("../controllers/analyticsController");

router.get("/monthly", protect, getMontlyAnalytics);
router.get("/categories", protect, getCategorySpending);
router.get("/summary", protect, getSummary);

module.exports = router;