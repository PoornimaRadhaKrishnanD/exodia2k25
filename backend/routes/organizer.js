const express = require("express");
const router = express.Router();
const {
  getOrganizerStats,
  getOrganizerTournaments,
  createTournament,
  updateTournament,
  deleteTournament,
  getTournamentRegistrations,
  getOrganizerProfile
} = require("../controllers/organizerController");

// Import JWT middleware
const jwt = require("jsonwebtoken");

// JWT Authentication middleware
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ 
      success: false,
      error: "Access token required" 
    });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ 
        success: false,
        error: "Invalid or expired token" 
      });
    }
    req.user = user;
    next();
  });
}

// Organizer-specific middleware
function requireOrganizer(req, res, next) {
  if (req.user.role !== 'organizer') {
    return res.status(403).json({
      success: false,
      error: "Organizer access required"
    });
  }
  next();
}

// All routes require authentication
router.use(authenticateToken);

// Profile routes
router.get("/profile", requireOrganizer, getOrganizerProfile);           // GET /api/organizer/profile

// Dashboard stats
router.get("/stats", requireOrganizer, getOrganizerStats);               // GET /api/organizer/stats

// Tournament management routes
router.get("/tournaments", requireOrganizer, getOrganizerTournaments);   // GET /api/organizer/tournaments
router.post("/tournaments", requireOrganizer, createTournament);         // POST /api/organizer/tournaments
router.put("/tournaments/:id", requireOrganizer, updateTournament);      // PUT /api/organizer/tournaments/:id
router.delete("/tournaments/:id", requireOrganizer, deleteTournament);   // DELETE /api/organizer/tournaments/:id

// Tournament registrations
router.get("/tournaments/:id/registrations", requireOrganizer, getTournamentRegistrations); // GET /api/organizer/tournaments/:id/registrations

module.exports = router;