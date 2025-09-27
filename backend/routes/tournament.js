const express = require("express");
const router = express.Router();
const { 
  getTournaments, 
  getTournamentById,
  createTournament, 
  updateTournament,
  deleteTournament,
  registerForTournament,
  getTournamentRegistrations,
  getAdminStats
} = require("../controllers/tournamentController");

// Import JWT middleware from auth routes
const jwt = require("jsonwebtoken");

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

// Optional auth middleware (doesn't fail if no token)
function optionalAuth(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (token) {
    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (!err) {
        req.user = user;
      }
    });
  }
  next();
}

// Public routes
router.get("/", getTournaments);                    // GET /api/tournaments
router.get("/stats", getAdminStats);              // GET /api/tournaments/stats
router.get("/:id", getTournamentById);            // GET /api/tournaments/:id

// Protected routes (require authentication)
router.get("/:id/registrations", authenticateToken, getTournamentRegistrations); // GET /api/tournaments/:id/registrations
router.post("/", authenticateToken, createTournament);              // POST /api/tournaments
router.put("/:id", authenticateToken, updateTournament);           // PUT /api/tournaments/:id
router.delete("/:id", authenticateToken, deleteTournament);        // DELETE /api/tournaments/:id
router.post("/:id/register", authenticateToken, registerForTournament); // POST /api/tournaments/:id/register

module.exports = router;
