
const express = require("express");
const router = express.Router();

const {
  getAdminDashboardAnalytics,
} = require("../controllers/adminAnalyticsController");

const { protect } = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

// Only logged-in admins can access dashboard analytics.
router.get("/", protect, adminOnly, getAdminDashboardAnalytics);

module.exports = router;
