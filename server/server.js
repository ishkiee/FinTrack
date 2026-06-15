const dns = require('dns');
dns.setDefaultResultOrder('ipv4first');
dns.setServers(['8.8.8.8', '8.8.4.4']);

const express = require("express");
const dotenv = require("dotenv");
const connectDB = require("./config/db");
const cors = require("cors");

dotenv.config();

// Temporary check
console.log(process.env.MONGO_URI);

connectDB();

const app = express();   // ✅ Create app first

app.use(cors());         // ✅ Then use middleware
app.use(express.json());

// Routes
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth", authRoutes);

const expenseRoutes = require("./routes/expenseRoutes");
app.use("/api/expenses", expenseRoutes);

const goalRoutes = require("./routes/goalRoutes");
app.use("/api/goals", goalRoutes);

const budgetRoutes = require("./routes/budgetRoutes");
app.use("/api/budgets", budgetRoutes);

const incomeRoutes = require("./routes/incomeRoutes");
app.use("/api/income", incomeRoutes);

const predictionRoutes = require("./routes/predictionRoutes");
app.use("/api/predictions", predictionRoutes);

const dashboardRoutes = require("./routes/dashboardRoutes");
app.use("/api/dashboard", dashboardRoutes);

const goalPredictionRoutes = require("./routes/goalPredictionRoutes");
app.use("/api/goals", goalPredictionRoutes);

app.get("/", (req, res) => {
    res.send("Track Finance Backend Running");
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});