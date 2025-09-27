const Tournament = require("../models/Tournament");
const User = require("../models/User");
const AdminStats = require("../models/AdminStats");
const TournamentRegistration = require("../models/TournamentRegistration");

// Get all tournaments with optional filtering
exports.getTournaments = async (req, res) => {
  try {
    console.log("🏆 Fetching tournaments...");
    
    const { status, type, limit, page = 1 } = req.query;
    const filter = {};
    
    if (status) filter.status = status;
    if (type) filter.type = type;
    
    const skip = (parseInt(page) - 1) * parseInt(limit || 10);
    
    let query = Tournament.find(filter)
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 });
    
    if (limit) {
      query = query.limit(parseInt(limit));
    }
    
    if (skip > 0) {
      query = query.skip(skip);
    }
    
    const tournaments = await query;
    const totalCount = await Tournament.countDocuments(filter);
    
    console.log(`✅ Found ${tournaments.length} tournaments`);
    
    res.status(200).json({
      success: true,
      data: tournaments,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / parseInt(limit || 10)),
        totalCount,
        hasNext: skip + tournaments.length < totalCount,
        hasPrev: parseInt(page) > 1
      }
    });
  } catch (err) {
    console.error("❌ Error fetching tournaments:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch tournaments",
      message: err.message 
    });
  }
};

// Get single tournament by ID
exports.getTournamentById = async (req, res) => {
  try {
    console.log("🔍 Fetching tournament:", req.params.id);
    
    const tournament = await Tournament.findById(req.params.id)
      .populate('organizer', 'name email')
      .populate('registeredUsers.userId', 'name email');
    
    if (!tournament) {
      return res.status(404).json({
        success: false,
        error: "Tournament not found"
      });
    }
    
    console.log("✅ Tournament found:", tournament.name);
    
    res.status(200).json({
      success: true,
      data: tournament
    });
  } catch (err) {
    console.error("❌ Error fetching tournament:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch tournament",
      message: err.message 
    });
  }
};

// Create a new tournament
exports.createTournament = async (req, res) => {
  try {
    console.log("🆕 Creating new tournament:", req.body.name);
    
    // Validate required fields
    const { name, type, date, maxParticipants, entryFee, organizer } = req.body;
    
    if (!name || !type || !date || !maxParticipants || !entryFee) {
      return res.status(400).json({
        success: false,
        error: "Missing required fields: name, type, date, maxParticipants, entryFee"
      });
    }
    
    // Set organizer from authenticated user if not provided
    const tournamentData = {
      ...req.body,
      organizer: organizer || req.user?.id
    };
    
    const tournament = new Tournament(tournamentData);
    const savedTournament = await tournament.save();
    
    // Populate organizer info for response
    await savedTournament.populate('organizer', 'name email');
    
    console.log("✅ Tournament created:", savedTournament._id);
    
    // Update admin stats
    await updateAdminStats();
    
    res.status(201).json({
      success: true,
      data: savedTournament,
      message: "Tournament created successfully"
    });
  } catch (err) {
    console.error("❌ Error creating tournament:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to create tournament",
      message: err.message 
    });
  }
};

// Update a tournament
exports.updateTournament = async (req, res) => {
  try {
    console.log("📝 Updating tournament:", req.params.id);
    
    const { id } = req.params;
    const updateData = req.body;
    
    const tournament = await Tournament.findByIdAndUpdate(
      id, 
      updateData, 
      { new: true, runValidators: true }
    ).populate('organizer', 'name email');
    
    if (!tournament) {
      return res.status(404).json({
        success: false,
        error: "Tournament not found"
      });
    }
    
    console.log("✅ Tournament updated:", tournament.name);
    
    // Update admin stats
    await updateAdminStats();
    
    res.status(200).json({
      success: true,
      data: tournament,
      message: "Tournament updated successfully"
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

// Delete a tournament
exports.deleteTournament = async (req, res) => {
  try {
    console.log("🗑️ Deleting tournament:", req.params.id);
    
    const { id } = req.params;
    const tournament = await Tournament.findByIdAndDelete(id);
    
    if (!tournament) {
      return res.status(404).json({
        success: false,
        error: "Tournament not found"
      });
    }
    
    console.log("✅ Tournament deleted:", tournament.name);
    
    // Update admin stats
    await updateAdminStats();
    
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

// Get tournament registrations (admin only)
exports.getTournamentRegistrations = async (req, res) => {
  try {
    console.log("📋 Fetching tournament registrations:", req.params.id);
    
    // Check if user is admin
    if (req.user?.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: "Admin access required"
      });
    }
    
    const tournament = await Tournament.findById(req.params.id)
      .select('name type date');
    
    if (!tournament) {
      return res.status(404).json({
        success: false,
        error: "Tournament not found"
      });
    }
    
    // Get all registrations for this tournament from the separate collection
    const registrations = await TournamentRegistration.findByTournament(req.params.id);
    
    console.log(`✅ Found ${registrations.length} detailed registrations`);
    
    res.status(200).json({
      success: true,
      data: {
        tournament: {
          id: tournament._id,
          name: tournament.name,
          type: tournament.type,
          date: tournament.date
        },
        registrations,
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

// Register user for tournament
exports.registerForTournament = async (req, res) => {
  try {
    console.log("📝 Registering user for tournament:", req.params.id);
    
    const { id } = req.params;
    const { userId, paymentStatus = "pending", transactionId, registrationData } = req.body;
    const userIdToRegister = userId || req.user?.id;
    
    if (!userIdToRegister) {
      return res.status(400).json({
        success: false,
        error: "User ID is required"
      });
    }
    
    // Validate registration data if provided
    if (registrationData) {
      const requiredFields = ['fullName', 'email', 'phone', 'dateOfBirth', 'gender', 'address', 'city', 'state', 'zipCode', 'emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelation'];
      const missingFields = requiredFields.filter(field => !registrationData[field]);
      
      if (missingFields.length > 0) {
        return res.status(400).json({
          success: false,
          error: `Missing required registration fields: ${missingFields.join(', ')}`
        });
      }

      if (!registrationData.agreeTerms) {
        return res.status(400).json({
          success: false,
          error: "You must agree to the terms and conditions"
        });
      }
    }
    
    const tournament = await Tournament.findById(id);
    if (!tournament) {
      return res.status(404).json({
        success: false,
        error: "Tournament not found"
      });
    }
    
    // Check if user already registered in the separate registration collection
    const existingRegistration = await TournamentRegistration.findOne({
      tournamentId: id,
      userId: userIdToRegister,
      isActive: true
    });
    
    if (existingRegistration) {
      return res.status(400).json({
        success: false,
        error: "User already registered for this tournament"
      });
    }
    
    // Check if tournament is full
    if (tournament.participants >= tournament.maxParticipants) {
      return res.status(400).json({
        success: false,
        error: "Tournament is full"
      });
    }
    
    // Create detailed registration record in separate collection
    let detailedRegistration = null;
    if (registrationData) {
      detailedRegistration = new TournamentRegistration({
        tournamentId: id,
        userId: userIdToRegister,
        paymentStatus,
        transactionId,
        
        // Personal Information
        personalInfo: {
          fullName: registrationData.fullName,
          email: registrationData.email,
          phone: registrationData.phone,
          dateOfBirth: new Date(registrationData.dateOfBirth),
          gender: registrationData.gender
        },
        
        // Address Information
        addressInfo: {
          address: registrationData.address,
          city: registrationData.city,
          state: registrationData.state,
          zipCode: registrationData.zipCode,
          country: registrationData.country || 'India'
        },
        
        // Emergency Contact
        emergencyContact: {
          name: registrationData.emergencyContactName,
          phone: registrationData.emergencyContactPhone,
          relation: registrationData.emergencyContactRelation
        },
        
        // Sports Information
        sportsInfo: {
          experience: registrationData.experience || 'beginner',
          previousTournaments: registrationData.previousTournaments || '',
          medicalConditions: registrationData.medicalConditions || '',
          specialRequirements: registrationData.specialRequirements || ''
        },
        
        // Additional Information
        additionalInfo: {
          howDidYouHear: registrationData.howDidYouHear,
          additionalComments: registrationData.additionalComments || ''
        },
        
        // Payment Information
        paymentInfo: {
          paymentMethod: registrationData.paymentMethod,
          amountPaid: paymentStatus === 'completed' ? tournament.entryFee : 0
        },
        
        // Agreements
        agreements: {
          termsAndConditions: registrationData.agreeTerms || false,
          privacyPolicy: true,
          marketingConsent: false,
          photoConsent: false
        },
        
        // Status
        status: {
          registrationStatus: paymentStatus === 'completed' ? 'confirmed' : 'pending'
        }
      });
      
      await detailedRegistration.save();
      console.log("✅ Detailed registration data saved to separate collection");
    }
    
    // Add basic registration to tournament document
    tournament.registeredUsers.push({
      userId: userIdToRegister,
      paymentStatus,
      transactionId
    });
    
    // Increment participants count
    tournament.participants += 1;
    
    await tournament.save();
    
    console.log("✅ User registered for tournament with detailed form data");
    
    // Update admin stats
    await updateAdminStats();
    
    res.status(200).json({
      success: true,
      message: "Successfully registered for tournament",
      data: {
        tournamentId: tournament._id,
        participants: tournament.participants,
        maxParticipants: tournament.maxParticipants,
        registrationId: detailedRegistration?._id,
        hasDetailedData: !!detailedRegistration
      }
    });
  } catch (err) {
    console.error("❌ Error registering for tournament:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to register for tournament",
      message: err.message 
    });
  }
};

// Get admin dashboard stats
exports.getAdminStats = async (req, res) => {
  try {
    console.log("📊 Fetching admin dashboard stats...");
    
    // Get or create admin stats
    let stats = await AdminStats.findOne().sort({ lastUpdated: -1 });
    
    if (!stats || isStatsOutdated(stats.lastUpdated)) {
      console.log("🔄 Updating admin stats...");
      stats = await updateAdminStats();
    }
    
    // Get recent tournaments
    const recentTournaments = await Tournament.find()
      .populate('organizer', 'name email')
      .sort({ createdAt: -1 })
      .limit(10);
    
    console.log("✅ Admin stats fetched");
    
    res.status(200).json({
      success: true,
      data: {
        stats,
        recentTournaments
      }
    });
  } catch (err) {
    console.error("❌ Error fetching admin stats:", err);
    res.status(500).json({ 
      success: false,
      error: "Failed to fetch admin stats",
      message: err.message 
    });
  }
};

// Helper function to update admin stats
async function updateAdminStats() {
  try {
    console.log("📈 Calculating admin statistics...");
    
    const totalTournaments = await Tournament.countDocuments();
    const activeTournaments = await Tournament.countDocuments({ 
      status: { $in: ['upcoming', 'ongoing'] } 
    });
    const completedTournaments = await Tournament.countDocuments({ status: 'completed' });
    const upcomingTournaments = await Tournament.countDocuments({ status: 'upcoming' });
    
    const totalUsers = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    
    // Calculate total revenue
    const revenueAgg = await Tournament.aggregate([
      {
        $group: {
          _id: null,
          totalRevenue: { $sum: '$totalRevenue' },
          totalParticipants: { $sum: '$participants' }
        }
      }
    ]);
    
    const totalRevenue = revenueAgg[0]?.totalRevenue || 0;
    const totalParticipants = revenueAgg[0]?.totalParticipants || 0;
    const averageParticipants = totalTournaments > 0 ? Math.round(totalParticipants / totalTournaments) : 0;
    
    // Calculate this month's revenue
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);
    
    const thisMonthRevenue = await Tournament.aggregate([
      {
        $match: {
          createdAt: { $gte: startOfMonth }
        }
      },
      {
        $group: {
          _id: null,
          revenue: { $sum: '$totalRevenue' }
        }
      }
    ]);
    
    const statsData = {
      totalTournaments,
      activeTournaments,
      completedTournaments,
      upcomingTournaments,
      totalUsers,
      activeUsers,
      totalRevenue,
      thisMonthRevenue: thisMonthRevenue[0]?.revenue || 0,
      averageParticipants,
      totalRegistrations: totalParticipants,
      lastUpdated: new Date()
    };
    
    // Update or create admin stats
    const stats = await AdminStats.findOneAndUpdate(
      {},
      statsData,
      { upsert: true, new: true }
    );
    
    console.log("✅ Admin stats updated");
    return stats;
    
  } catch (error) {
    console.error("❌ Error updating admin stats:", error);
    throw error;
  }
}

// Helper function to check if stats are outdated (older than 5 minutes)
function isStatsOutdated(lastUpdated) {
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
  return !lastUpdated || lastUpdated < fiveMinutesAgo;
}
