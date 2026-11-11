
const express = require("express");
const router = express.Router();

const {
  registerUser,
  loginUser,
  getMyProfile,
} = require("../controllers/authController");

const { protect } = require("../middleware/authMiddleware");

router.post("/register", registerUser);
router.post("/login", loginUser);

// Protected profile route
router.get("/profile", protect, getMyProfile);

module.exports = router;
