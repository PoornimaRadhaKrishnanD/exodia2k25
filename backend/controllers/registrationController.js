const TournamentRegistration = require("../models/TournamentRegistration");
const Tournament = require("../models/Tournament");
const User = require("../models/User");

// Get all registrations (admin only)
const getAllRegistrations = async (req, res) => {
  try {
    console.log("📋 Fetching all tournament registrations");
    
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: "Admin access required"
      });
    }
    
    const { page = 1, limit = 20, status, tournament } = req.query;
    const filter = { isActive: true };
    
    if (status) filter['status.registrationStatus'] = status;
    if (tournament) filter.tournamentId = tournament;
    
    const registrations = await TournamentRegistration.find(filter)
      .populate('userId', 'name email phone')
      .populate('tournamentId', 'name type date status')
      .sort({ registrationDate: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const totalCount = await TournamentRegistration.countDocuments(filter);
    
    console.log(`✅ Found ${registrations.length} registrations`);
    
    res.status(200).json({
      success: true,
      data: registrations,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        hasNext: (parseInt(page) * parseInt(limit)) < totalCount,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error("❌ Error fetching registrations:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch registrations",
      message: err.message 
    });
  }
};

// Get user's registrations
const getUserRegistrations = async (req, res) => {
  try {
    console.log("👤 Fetching registrations for user:", req.user.id);
    
    const registrations = await TournamentRegistration.findByUser(req.user.id);
    
    console.log(`✅ Found ${registrations.length} registrations for user`);
    
    res.status(200).json({
      success: true,
      data: registrations,
      totalRegistrations: registrations.length
    });
  } catch (err) {
    console.error("❌ Error fetching user registrations:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch user registrations",
      message: err.message 
    });
  }
};

// Get specific registration details
const getRegistrationDetails = async (req, res) => {
  try {
    console.log("🔍 Fetching registration details:", req.params.id);
    
    const registration = await TournamentRegistration.findById(req.params.id)
      .populate('userId', 'name email phone')
      .populate('tournamentId', 'name type date status entryFee');
    
    if (!registration) {
      return res.status(404).json({
        success: false,
        error: "Registration not found"
      });
    }
    
    // Check if user has access (either owner or admin)
    if (req.user.role !== 'admin' && registration.userId._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "Access denied"
      });
    }
    
    console.log("✅ Registration details retrieved");
    
    res.status(200).json({
      success: true,
      data: registration
    });
  } catch (err) {
    console.error("❌ Error fetching registration details:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch registration details",
      message: err.message 
    });
  }
};

// Update registration status (admin only)
const updateRegistrationStatus = async (req, res) => {
  try {
    console.log("📝 Updating registration status:", req.params.id);
    
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: "Admin access required"
      });
    }
    
    const { status, paymentStatus, note } = req.body;
    
    const registration = await TournamentRegistration.findById(req.params.id);
    
    if (!registration) {
      return res.status(404).json({
        success: false,
        error: "Registration not found"
      });
    }
    
    // Update status fields
    if (status) registration.status.registrationStatus = status;
    if (paymentStatus) registration.paymentStatus = paymentStatus;
    
    // Add admin note if provided
    if (note) {
      registration.adminNotes.push({
        note: note,
        addedBy: req.user.id,
        addedAt: new Date()
      });
    }
    
    await registration.save();
    
    console.log("✅ Registration status updated");
    
    res.status(200).json({
      success: true,
      message: "Registration status updated successfully",
      data: registration
    });
  } catch (err) {
    console.error("❌ Error updating registration status:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to update registration status",
      message: err.message 
    });
  }
};

// Get registration statistics (admin only)
const getRegistrationStats = async (req, res) => {
  try {
    console.log("📊 Fetching registration statistics");
    
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: "Admin access required"
      });
    }
    
    const totalRegistrations = await TournamentRegistration.countDocuments({ isActive: true });
    const confirmedRegistrations = await TournamentRegistration.countDocuments({ 
      'status.registrationStatus': 'confirmed',
      isActive: true 
    });
    const pendingRegistrations = await TournamentRegistration.countDocuments({ 
      'status.registrationStatus': 'pending',
      isActive: true 
    });
    const completedPayments = await TournamentRegistration.countDocuments({ 
      paymentStatus: 'completed',
      isActive: true 
    });
    
    // Registration trend (last 30 days)
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    
    const recentRegistrations = await TournamentRegistration.countDocuments({
      registrationDate: { $gte: thirtyDaysAgo },
      isActive: true
    });
    
    // Revenue calculation
    const revenueData = await TournamentRegistration.aggregate([
      {
        $match: { 
          paymentStatus: 'completed',
          isActive: true
        }
      },
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$paymentInfo.amountPaid' },
          avgPayment: { $avg: '$paymentInfo.amountPaid' }
        }
      }
    ]);
    
    const stats = {
      totalRegistrations,
      confirmedRegistrations,
      pendingRegistrations,
      completedPayments,
      recentRegistrations,
      totalRevenue: revenueData[0]?.totalRevenue || 0,
      averagePayment: revenueData[0]?.avgPayment || 0
    };
    
    console.log("✅ Registration statistics calculated");
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (err) {
    console.error("❌ Error fetching registration statistics:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch registration statistics",
      message: err.message 
    });
  }
};

module.exports = {
  getAllRegistrations,
  getUserRegistrations,
  getRegistrationDetails,
  updateRegistrationStatus,
  getRegistrationStats
};