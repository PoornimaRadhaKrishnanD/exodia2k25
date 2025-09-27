const Tournament = require("../models/Tournament");
const User = require("../models/User");
const TournamentRegistration = require("../models/TournamentRegistration");

// Get organizer dashboard stats
const getOrganizerStats = async (req, res) => {
  try {
    console.log("📊 Fetching organizer dashboard stats for:", req.user.id);
    
    // Check if user is organizer
    if (req.user.role !== 'organizer') {
      return res.status(403).json({
        success: false,
        error: "Organizer access required"
      });
    }

    const organizerId = req.user.id;
    
    // Get organizer's tournaments
    const tournaments = await Tournament.find({ 
      organizer: organizerId,
      isActive: true 
    }).populate('registeredUsers.userId', 'name email');
    
    // Calculate statistics
    const totalTournaments = tournaments.length;
    const upcomingTournaments = tournaments.filter(t => t.status === 'upcoming').length;
    const ongoingTournaments = tournaments.filter(t => t.status === 'ongoing').length;
    const completedTournaments = tournaments.filter(t => t.status === 'completed').length;
    
    // Calculate participants and revenue
    let totalParticipants = 0;
    let totalRevenue = 0;
    let thisMonthRevenue = 0;
    
    const currentDate = new Date();
    const currentMonth = currentDate.getMonth();
    const currentYear = currentDate.getFullYear();
    
    tournaments.forEach(tournament => {
      totalParticipants += tournament.participants;
      totalRevenue += tournament.totalRevenue;
      
      // Calculate this month's revenue
      const tournamentDate = new Date(tournament.date);
      if (tournamentDate.getMonth() === currentMonth && 
          tournamentDate.getFullYear() === currentYear) {
        thisMonthRevenue += tournament.totalRevenue;
      }
    });
    
    const averageParticipants = totalTournaments > 0 ? Math.round(totalParticipants / totalTournaments) : 0;
    
    const stats = {
      totalTournaments,
      upcomingTournaments,
      ongoingTournaments,
      completedTournaments,
      totalParticipants,
      totalRevenue,
      thisMonthRevenue,
      averageParticipants,
      activeTournaments: upcomingTournaments + ongoingTournaments
    };
    
    console.log("✅ Organizer stats calculated:", stats);
    
    res.status(200).json({
      success: true,
      data: stats
    });
  } catch (err) {
    console.error("❌ Error fetching organizer stats:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch organizer statistics",
      message: err.message 
    });
  }
};

// Get organizer's tournaments
const getOrganizerTournaments = async (req, res) => {
  try {
    console.log("🏆 Fetching tournaments for organizer:", req.user.id);
    
    // Check if user is organizer
    if (req.user.role !== 'organizer') {
      return res.status(403).json({
        success: false,
        error: "Organizer access required"
      });
    }

    const { page = 1, limit = 10, status } = req.query;
    const organizerId = req.user.id;
    
    const filter = { 
      organizer: organizerId,
      isActive: true 
    };
    
    if (status && status !== 'all') {
      filter.status = status;
    }
    
    const tournaments = await Tournament.find(filter)
      .populate('registeredUsers.userId', 'name email phone')
      .sort({ date: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit));
    
    const totalCount = await Tournament.countDocuments(filter);
    
    console.log(`✅ Found ${tournaments.length} tournaments for organizer`);
    
    res.status(200).json({
      success: true,
      data: tournaments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit)),
        totalCount,
        hasNext: (parseInt(page) * parseInt(limit)) < totalCount,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error("❌ Error fetching organizer tournaments:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch organizer tournaments",
      message: err.message 
    });
  }
};

// Create tournament (organizer only)
const createTournament = async (req, res) => {
  try {
    console.log("🎯 Creating tournament by organizer:", req.user.id);
    console.log("Tournament data:", req.body);
    
    // Check if user is organizer
    if (req.user.role !== 'organizer') {
      return res.status(403).json({
        success: false,
        error: "Organizer access required"
      });
    }

    const {
      name,
      type,
      date,
      endDate,
      maxParticipants,
      entryFee,
      description,
      location,
      rules,
      prizes
    } = req.body;

    // Validation
    if (!name || !type || !date || !maxParticipants || entryFee === undefined) {
      return res.status(400).json({
        success: false,
        error: "Name, type, date, max participants, and entry fee are required"
      });
    }

    // Check if tournament date is in the future
    const tournamentDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (tournamentDate < today) {
      return res.status(400).json({
        success: false,
        error: "Tournament date must be in the future"
      });
    }

    // Create tournament
    const tournament = new Tournament({
      name: name.trim(),
      type,
      date: tournamentDate,
      endDate: endDate ? new Date(endDate) : null,
      maxParticipants: parseInt(maxParticipants),
      entryFee: parseFloat(entryFee),
      description: description?.trim() || "",
      location: location?.trim() || "",
      rules: rules || [],
      prizes: prizes || [],
      organizer: req.user.id,
      participants: 0,
      totalRevenue: 0,
      status: "upcoming"
    });

    const savedTournament = await tournament.save();
    
    // Update organizer's tournament count
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 'organizerInfo.totalTournaments': 1 }
    });

    console.log("✅ Tournament created successfully:", savedTournament._id);

    // Populate organizer info for response
    const populatedTournament = await Tournament.findById(savedTournament._id)
      .populate('organizer', 'name email organizerInfo');

    res.status(201).json({
      success: true,
      message: "Tournament created successfully",
      data: populatedTournament
    });

  } catch (err) {
    console.error("❌ Error creating tournament:", err);
    
    // Handle validation errors
    if (err.name === 'ValidationError') {
      const validationErrors = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        success: false,
        error: "Validation failed",
        details: validationErrors
      });
    }
    
    res.status(500).json({ 
      success: false,
      error: "Failed to create tournament",
      message: err.message 
    });
  }
};

// Update tournament (organizer only - their own tournaments)
const updateTournament = async (req, res) => {
  try {
    console.log("📝 Updating tournament:", req.params.id, "by organizer:", req.user.id);
    
    // Check if user is organizer
    if (req.user.role !== 'organizer') {
      return res.status(403).json({
        success: false,
        error: "Organizer access required"
      });
    }

    const tournament = await Tournament.findById(req.params.id);
    
    if (!tournament) {
      return res.status(404).json({
        success: false,
        error: "Tournament not found"
      });
    }
    
    // Check if organizer owns this tournament
    if (tournament.organizer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "You can only update your own tournaments"
      });
    }
    
    // Don't allow updates to completed tournaments
    if (tournament.status === 'completed') {
      return res.status(400).json({
        success: false,
        error: "Cannot update completed tournaments"
      });
    }

    const updates = req.body;
    
    // Remove fields that shouldn't be updated directly
    delete updates.organizer;
    delete updates.participants;
    delete updates.totalRevenue;
    delete updates.registeredUsers;
    
    // Update tournament
    Object.assign(tournament, updates);
    const updatedTournament = await tournament.save();

    console.log("✅ Tournament updated successfully");

    res.status(200).json({
      success: true,
      message: "Tournament updated successfully",
      data: updatedTournament
    });

  } catch (err) {
    console.error("❌ Error updating tournament:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to update tournament",
      message: err.message 
    });
  }
};

// Delete tournament (organizer only - their own tournaments)
const deleteTournament = async (req, res) => {
  try {
    console.log("🗑️ Deleting tournament:", req.params.id, "by organizer:", req.user.id);
    
    // Check if user is organizer
    if (req.user.role !== 'organizer') {
      return res.status(403).json({
        success: false,
        error: "Organizer access required"
      });
    }

    const tournament = await Tournament.findById(req.params.id);
    
    if (!tournament) {
      return res.status(404).json({
        success: false,
        error: "Tournament not found"
      });
    }
    
    // Check if organizer owns this tournament
    if (tournament.organizer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "You can only delete your own tournaments"
      });
    }
    
    // Check if tournament has participants (soft delete instead of hard delete)
    if (tournament.participants > 0) {
      tournament.isActive = false;
      await tournament.save();
      
      console.log("✅ Tournament soft deleted (has participants)");
      
      return res.status(200).json({
        success: true,
        message: "Tournament deactivated successfully (has participants)"
      });
    }
    
    // Hard delete if no participants
    await Tournament.findByIdAndDelete(req.params.id);
    
    // Update organizer's tournament count
    await User.findByIdAndUpdate(req.user.id, {
      $inc: { 'organizerInfo.totalTournaments': -1 }
    });

    console.log("✅ Tournament deleted successfully");

    res.status(200).json({
      success: true,
      message: "Tournament deleted successfully"
    });

  } catch (err) {
    console.error("❌ Error deleting tournament:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to delete tournament",
      message: err.message 
    });
  }
};

// Get tournament registrations (organizer's own tournaments)
const getTournamentRegistrations = async (req, res) => {
  try {
    console.log("📋 Fetching registrations for tournament:", req.params.id, "by organizer:", req.user.id);
    
    // Check if user is organizer
    if (req.user.role !== 'organizer') {
      return res.status(403).json({
        success: false,
        error: "Organizer access required"
      });
    }

    const tournament = await Tournament.findById(req.params.id);
    
    if (!tournament) {
      return res.status(404).json({
        success: false,
        error: "Tournament not found"
      });
    }
    
    // Check if organizer owns this tournament
    if (tournament.organizer.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        error: "You can only view registrations for your own tournaments"
      });
    }

    // Get detailed registrations from TournamentRegistration model
    const registrations = await TournamentRegistration.find({
      tournamentId: req.params.id,
      isActive: true
    })
    .populate('userId', 'name email phone')
    .sort({ registrationDate: -1 });

    console.log(`✅ Found ${registrations.length} registrations for tournament`);

    res.status(200).json({
      success: true,
      data: {
        tournament: {
          id: tournament._id,
          name: tournament.name,
          type: tournament.type,
          date: tournament.date,
          participants: tournament.participants,
          maxParticipants: tournament.maxParticipants,
          entryFee: tournament.entryFee,
          totalRevenue: tournament.totalRevenue
        },
        registrations: registrations,
        totalRegistrations: registrations.length
      }
    });

  } catch (err) {
    console.error("❌ Error fetching tournament registrations:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch tournament registrations",
      message: err.message 
    });
  }
};

// Get organizer profile with statistics
const getOrganizerProfile = async (req, res) => {
  try {
    console.log("👤 Fetching organizer profile:", req.user.id);
    
    // Check if user is organizer
    if (req.user.role !== 'organizer') {
      return res.status(403).json({
        success: false,
        error: "Organizer access required"
      });
    }

    const organizer = await User.findById(req.user.id).select('-password');
    
    if (!organizer) {
      return res.status(404).json({
        success: false,
        error: "Organizer not found"
      });
    }

    // Get tournament statistics
    const tournaments = await Tournament.find({
      organizer: req.user.id,
      isActive: true
    });

    const totalTournaments = tournaments.length;
    const completedTournaments = tournaments.filter(t => t.status === 'completed').length;
    const totalParticipants = tournaments.reduce((sum, t) => sum + t.participants, 0);
    const totalRevenue = tournaments.reduce((sum, t) => sum + t.totalRevenue, 0);

    // Calculate average rating (placeholder for now)
    const averageRating = organizer.organizerInfo.rating || 0;

    res.status(200).json({
      success: true,
      data: {
        ...organizer.toObject(),
        statistics: {
          totalTournaments,
          completedTournaments,
          totalParticipants,
          totalRevenue,
          averageRating,
          successRate: totalTournaments > 0 ? Math.round((completedTournaments / totalTournaments) * 100) : 0
        },
        recentLogins: organizer.loginHistory.slice(-5)
      }
    });

  } catch (err) {
    console.error("❌ Error fetching organizer profile:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch organizer profile",
      message: err.message 
    });
  }
};

module.exports = {
  getOrganizerStats,
  getOrganizerTournaments,
  createTournament,
  updateTournament,
  deleteTournament,
  getTournamentRegistrations,
  getOrganizerProfile
};