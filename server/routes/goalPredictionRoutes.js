const express = require("express");
const router = express.Router();
const protect = require("../middleware/authMiddleware");
const { predictGoalCompletion } = require("../controllers/goalPredictionController");

router.get("/predict/:id", protect, predictGoalCompletion);

module.exports = router;