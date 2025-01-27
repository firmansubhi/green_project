const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
require("dotenv").config();

// Route imports
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const productRoutes = require("./routes/product");
const transactionRoutes = require("./routes/transaction");
const paymentRoutes = require("./routes/payment");

const app = express();

// Middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/product", productRoutes);
app.use("/transactions", transactionRoutes);
app.use("/payments", paymentRoutes);

// Database connection
mongoose.connect("mongodb://localhost:27017/recycling", {});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "Connection error:"));
db.once("open", () => {
	console.log("Connected to MongoDB");
});

// Start server
const PORT = process.env.PORT;
app.listen(PORT, () => {
	console.log(`Server running on http://localhost:${PORT}`);
});
