const express = require("express");
const router = express.Router();
const jwt = require("jsonwebtoken");

// Import registration controller
const { 
  getAllRegistrations, 
  getUserRegistrations,
  getRegistrationDetails,
  updateRegistrationStatus,
  getRegistrationStats
} = require("../controllers/registrationController");

// JWT Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    req.user = user;
    next();
  });
}

// Routes
router.get("/", authenticateToken, getAllRegistrations);                    // GET /api/registrations (admin)
router.get("/my", authenticateToken, getUserRegistrations);                 // GET /api/registrations/my (user's own)
router.get("/stats", authenticateToken, getRegistrationStats);              // GET /api/registrations/stats (admin)
router.get("/:id", authenticateToken, getRegistrationDetails);              // GET /api/registrations/:id
router.patch("/:id/status", authenticateToken, updateRegistrationStatus);   // PATCH /api/registrations/:id/status (admin)

module.exports = router;