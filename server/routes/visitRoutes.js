
const express = require("express");
const router = express.Router();

const {
  trackVisit,
  getVisitorAnalytics,
} = require("../controllers/visitController");

const { protect } = require("../middleware/authMiddleware");
const adminOnly = require("../middleware/adminMiddleware");

// Public route: record a website visit.
router.post("/", trackVisit);

// Admin-only route: retrieve visitor analytics.
router.get("/analytics", protect, adminOnly, getVisitorAnalytics);

module.exports = router;
