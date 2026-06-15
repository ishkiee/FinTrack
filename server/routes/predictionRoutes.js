const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { getBudgetPrediction } = require("../controllers/predictionController");

router.get("/budget", protect, getBudgetPrediction);

module.exports = router;