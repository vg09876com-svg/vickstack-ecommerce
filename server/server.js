
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const dns = require("dns");
require("dotenv").config();

// Use Google DNS.
dns.setServers(["8.8.8.8", "8.8.4.4"]);

const authRoutes = require("./routes/authRoutes");
const productRoutes = require("./routes/productRoutes");
const orderRoutes = require("./routes/orderRoutes");
const visitRoutes = require("./routes/visitRoutes");
const adminAnalyticsRoutes = require("./routes/adminAnalyticsRoutes");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection (reused between serverless requests).
let connectionPromise;

const connectToDatabase = async () => {
  if (mongoose.connection.readyState === 1) {
    return;
  }

  if (mongoose.connection.readyState === 2 && connectionPromise) {
    return connectionPromise;
  }

  connectionPromise = mongoose
    .connect(process.env.MONGO_URI)
    .catch((error) => {
      connectionPromise = null;
      throw error;
    });

  return connectionPromise;
};

// Ensure MongoDB is connected before handling requests.
app.use(async (req, res, next) => {
  try {
    await connectToDatabase();
    next();
  } catch (error) {
    console.error("MongoDB connection error:", error);
    res.status(500).json({
      message: "Database connection failed.",
    });
  }
});

// API Routes
app.use("/api/auth", authRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/visits", visitRoutes);
app.use("/api/admin/analytics", adminAnalyticsRoutes);

// Home route
app.get("/", (req, res) => {
  res.send("Welcome to VICKSTACK API!");
});

// Health check
app.get("/api/health", (req, res) => {
  res.status(200).json({
    message: "VICKSTACK server is healthy",
    database:
      mongoose.connection.readyState === 1
        ? "Connected"
        : "Disconnected",
  });
});

// Unknown route handler
app.use((req, res) => {
  res.status(404).json({
    message: "Route not found",
  });
});

// Export Express app for Vercel.
module.exports = app;

// Start a local server only when running this file directly.
if (require.main === module) {
  const PORT = process.env.PORT || 5000;

  connectToDatabase()
    .then(() => {
      console.log("MongoDB connected successfully!");

      app.listen(PORT, "0.0.0.0", () => {
        console.log(`VICKSTACK server running on port ${PORT}`);
      });
    })
    .catch((error) => {
      console.error("MongoDB connection error:", error);
      process.exit(1);
    });
}
