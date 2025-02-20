const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
require("dotenv").config();

// Route imports
const authRoutes = require("./routes/auth");
const userRoutes = require("./routes/user");
const productRoutes = require("./routes/product");
const transactionRoutes = require("./routes/transaction");
const paymentRoutes = require("./routes/payment");
const newsRoutes = require("./routes/news");
const listingRoutes = require("./routes/listing");

const app = express();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
app.use(fileUpload());

// Routes
app.use("/auth", authRoutes);
app.use("/users", userRoutes);
app.use("/product", productRoutes);
app.use("/transactions", transactionRoutes);
app.use("/payments", paymentRoutes);
app.use("/newsadmin", newsRoutes);
app.use("/listing", listingRoutes);

// Database connection
mongoose.connect("mongodb://localhost:27017/" + process.env.DB_NAME, {});

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
