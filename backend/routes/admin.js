const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Tournament = require("../models/Tournament");
const AdminStats = require("../models/AdminStats");
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

// Admin authorization middleware
function requireAdmin(req, res, next) {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ error: "Admin access required" });
  }
  next();
}

// Get comprehensive dashboard data
router.get("/dashboard", authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log("📊 Admin dashboard data request");

    // Get basic stats
    const totalTournaments = await Tournament.countDocuments();
    const activeTournaments = await Tournament.countDocuments({ 
      status: { $in: ['upcoming', 'ongoing'] } 
    });
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });

    // Calculate revenue stats
    const revenueStats = await Tournament.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalRevenue' },
          totalParticipants: { $sum: '$participants' }
        }
      }
    ]);

    // This month's revenue
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const thisMonthStats = await Tournament.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$totalRevenue' },
          tournaments: { $sum: 1 }
        }
      }
    ]);

    // Get recent tournaments with full data
    const tournaments = await Tournament.find()
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 })
      .limit(20);

    const totalRevenue = revenueStats[0]?.totalRevenue || 0;
    const totalParticipants = revenueStats[0]?.totalParticipants || 0;
    const averageParticipants = totalTournaments > 0 ? Math.round(totalParticipants / totalTournaments) : 0;

    const dashboardData = {
      stats: {
        totalTournaments,
        activeTournaments,
        totalUsers,
        activeUsers,
        totalRevenue,
        thisMonthRevenue: thisMonthStats[0]?.revenue || 0,
        averageParticipants
      },
      tournaments: tournaments.map(t => ({
        id: t._id,
        name: t.name,
        type: t.type,
        status: t.status,
        date: t.date,
        participants: t.participants,
        maxParticipants: t.maxParticipants,
        entryFee: t.entryFee,
        totalRevenue: t.totalRevenue,
        organizer: t.organizer
      }))
    };

    console.log("✅ Dashboard data prepared");
    
    res.json({
      success: true,
      data: dashboardData
    });

  } catch (error) {
    console.error("❌ Dashboard error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch dashboard data",
      message: error.message
    });
  }
});

// Get all users for admin management
router.get("/users", authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log("👥 Admin users request");

    const { page = 1, limit = 10, search, status } = req.query;
    const filter = {};

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }

    if (status) {
      filter.isActive = status === 'active';
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filter, { password: 0 })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalCount = await User.countDocuments(filter);

    res.json({
      success: true,
      data: users,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        hasNext: skip + users.length < totalCount,
        hasPrev: parseInt(page) > 1
      }
    });

  } catch (error) {
    console.error("❌ Users fetch error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch users",
      message: error.message
    });
  }
});

// Update user status
router.put("/users/:id/status", authenticateToken, requireAdmin, async (req, res) => {
  try {
    const { id } = req.params;
    const { isActive } = req.body;

    const user = await User.findByIdAndUpdate(
      id,
      { isActive },
      { new: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        error: "User not found"
      });
    }

    res.json({
      success: true,
      data: user,
      message: `User ${isActive ? 'activated' : 'deactivated'} successfully`
    });

  } catch (error) {
    console.error("❌ User status update error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to update user status",
      message: error.message
    });
  }
});

// Get revenue analytics
router.get("/analytics/revenue", authenticateToken, requireAdmin, async (req, res) => {
  try {
    console.log("📈 Revenue analytics request");

    const { period = '6months' } = req.query;
    
    let dateFilter = {};
    let groupBy = {};

    if (period === '6months') {
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      dateFilter = { createdAt: { $gte: sixMonthsAgo } };
      groupBy = {
        year: { $year: '$createdAt' },
        month: { $month: '$createdAt' }
      };
    }

    const analytics = await Tournament.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: groupBy,
          revenue: { $sum: '$totalRevenue' },
          tournaments: { $sum: 1 },
          participants: { $sum: '$participants' }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({
      success: true,
      data: analytics
    });

  } catch (error) {
    console.error("❌ Analytics error:", error);
    res.status(500).json({
      success: false,
      error: "Failed to fetch analytics",
      message: error.message
    });
  }
});

module.exports = router;