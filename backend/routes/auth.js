const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

// Organizer registration route
router.post("/organizer/register", async (req, res) => {
  try {
    console.log("📝 Organizer registration attempt:", { name: req.body.name, email: req.body.email });
    
    const { name, email, phone, password, organizationName, experience, specialization, bio } = req.body;

    // Basic input validation
    if (!name || !email || !password) {
      console.log("❌ Validation failed: Missing fields");
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      console.log("❌ Validation failed: Password too short");
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    // Check if user exists
    console.log("🔍 Checking if organizer exists...");
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("❌ Organizer already exists:", email);
      return res.status(400).json({ error: "Organizer already exists" });
    }

    // Hash password
    console.log("🔒 Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new organizer
    console.log("💾 Creating new organizer...");
    const organizer = new User({
      name,
      email,
      phone,
      password: hashedPassword,
      role: "organizer",
      organizerInfo: {
        organizationName: organizationName || name,
        experience: experience || 0,
        specialization: specialization || [],
        bio: bio || "",
        verificationStatus: "pending"
      }
    });

    const savedOrganizer = await organizer.save();
    console.log("✅ Organizer created successfully:", savedOrganizer._id);

    // Create JWT token for automatic login
    const token = jwt.sign(
      { id: savedOrganizer._id, email: savedOrganizer.email, role: savedOrganizer.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" }
    );

    // Don't send password back in response
    const { password: _, ...organizerWithoutPassword } = savedOrganizer.toObject();
    res.status(201).json({ 
      message: "Organizer registered successfully", 
      token,
      userId: savedOrganizer._id,
      user: organizerWithoutPassword
    });
  } catch (err) {
    console.error("❌ Organizer registration error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Organizer login route
router.post("/organizer/login", async (req, res) => {
  try {
    console.log("🔐 Organizer login attempt:", req.body.email);
    
    const { email, password } = req.body;

    // Basic input validation
    if (!email || !password) {
      console.log("❌ Login validation failed: Missing credentials");
      return res.status(400).json({ error: "Email and password are required" });
    }

    console.log("🔍 Looking for organizer:", email);
    const user = await User.findOne({ email, role: "organizer" });
    
    if (!user) {
      console.log("❌ Organizer not found:", email);
      return res.status(400).json({ error: "Invalid organizer credentials" });
    }

    // Check if organizer is active
    if (!user.isActive) {
      console.log("❌ Organizer account is deactivated:", email);
      return res.status(400).json({ error: "Account is deactivated. Please contact support." });
    }

    console.log("✅ Organizer found, checking password...");
    const validPass = await bcrypt.compare(password, user.password);
    
    if (!validPass) {
      console.log("❌ Invalid password for organizer:", email);
      
      // Log failed login attempt
      user.loginHistory.push({
        loginTime: new Date(),
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        success: false
      });
      await user.save();
      
      return res.status(400).json({ error: "Invalid organizer credentials" });
    }

    console.log("🎫 Generating JWT token for organizer...");
    // Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" }
    );

    // Update login information
    console.log("📊 Updating organizer login statistics...");
    user.lastLogin = new Date();
    user.loginCount += 1;
    
    // Add to login history
    user.loginHistory.push({
      loginTime: new Date(),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      success: true
    });

    // Keep only last 10 login history entries
    if (user.loginHistory.length > 10) {
      user.loginHistory = user.loginHistory.slice(-10);
    }

    await user.save();

    console.log("✅ Organizer login successful:", email);
    
    // Don't send password back in response
    const { password: _, loginHistory, ...userWithoutSensitiveData } = user.toObject();
    
    res.json({ 
      message: "Organizer login successful", 
      token,
      user: userWithoutSensitiveData,
      loginCount: user.loginCount,
      lastLogin: user.lastLogin
    });
    
  } catch (err) {
    console.error("❌ Organizer login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Register route
router.post("/register", async (req, res) => {
  try {
    console.log("📝 Registration attempt:", { name: req.body.name, email: req.body.email });
    
    const { name, email, phone, password } = req.body;

    // Basic input validation
    if (!name || !email || !password) {
      console.log("❌ Validation failed: Missing fields");
      return res.status(400).json({ error: "Name, email, and password are required" });
    }

    if (password.length < 6) {
      console.log("❌ Validation failed: Password too short");
      return res.status(400).json({ error: "Password must be at least 6 characters long" });
    }

    // Check if user exists
    console.log("🔍 Checking if user exists...");
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      console.log("❌ User already exists:", email);
      return res.status(400).json({ error: "User already exists" });
    }

    // Hash password
    console.log("🔒 Hashing password...");
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create new user
    console.log("💾 Creating new user...");
    const user = new User({
      name,
      email,
      phone,
      password: hashedPassword
    });

    const savedUser = await user.save();
    console.log("✅ User created successfully:", savedUser._id);

    // Create JWT token for automatic login
    const token = jwt.sign(
      { id: savedUser._id, email: savedUser.email, role: savedUser.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" }
    );

    // Don't send password back in response
    const { password: _, ...userWithoutPassword } = savedUser.toObject();
    res.status(201).json({ 
      message: "User registered successfully", 
      token,
      userId: savedUser._id,
      user: userWithoutPassword
    });
  } catch (err) {
    console.error("❌ Registration error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Login route
router.post("/login", async (req, res) => {
  try {
    console.log("🔐 Login attempt:", req.body.email);
    
    const { email, password } = req.body;

    // Basic input validation
    if (!email || !password) {
      console.log("❌ Login validation failed: Missing credentials");
      return res.status(400).json({ error: "Email and password are required" });
    }

    console.log("🔍 Looking for user:", email);
    const user = await User.findOne({ email });
    
    // Track failed login attempt
    if (!user) {
      console.log("❌ User not found:", email);
      return res.status(400).json({ error: "Invalid email or password" });
    }

    // Check if user is active
    if (!user.isActive) {
      console.log("❌ User account is deactivated:", email);
      return res.status(400).json({ error: "Account is deactivated. Please contact support." });
    }

    console.log("✅ User found, checking password...");
    const validPass = await bcrypt.compare(password, user.password);
    
    if (!validPass) {
      console.log("❌ Invalid password for:", email);
      
      // Log failed login attempt
      user.loginHistory.push({
        loginTime: new Date(),
        ipAddress: req.ip || req.connection.remoteAddress,
        userAgent: req.get('User-Agent'),
        success: false
      });
      await user.save();
      
      return res.status(400).json({ error: "Invalid email or password" });
    }

    console.log("🎫 Generating JWT token...");
    // Create JWT token
    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role }, 
      process.env.JWT_SECRET, 
      { expiresIn: "7d" }
    );

    // Update login information
    console.log("📊 Updating login statistics...");
    user.lastLogin = new Date();
    user.loginCount += 1;
    
    // Add to login history
    user.loginHistory.push({
      loginTime: new Date(),
      ipAddress: req.ip || req.connection.remoteAddress,
      userAgent: req.get('User-Agent'),
      success: true
    });

    // Keep only last 10 login history entries
    if (user.loginHistory.length > 10) {
      user.loginHistory = user.loginHistory.slice(-10);
    }

    await user.save();

    console.log("✅ Login successful:", email);
    
    // Don't send password back in response
    const { password: _, loginHistory, ...userWithoutSensitiveData } = user.toObject();
    
    res.json({ 
      message: "Login successful", 
      token,
      user: userWithoutSensitiveData,
      loginCount: user.loginCount,
      lastLogin: user.lastLogin
    });
    
  } catch (err) {
    console.error("❌ Login error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get user profile (protected route)
router.get("/profile", authenticateToken, async (req, res) => {
  try {
    console.log("👤 Profile request for user:", req.user.id);
    
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Import Tournament model for stats calculation
    const Tournament = require("../models/Tournament");
    
    // Calculate user tournament statistics
    const userTournaments = await Tournament.find({
      'registeredUsers.userId': req.user.id,
      isActive: true
    });
    
    const joinedTournaments = userTournaments.length;
    
    // Calculate total amount spent
    let totalSpent = 0;
    userTournaments.forEach(tournament => {
      const userRegistration = tournament.registeredUsers.find(
        reg => reg.userId.toString() === req.user.id
      );
      if (userRegistration && userRegistration.paymentStatus === 'completed') {
        totalSpent += tournament.entryFee;
      }
    });
    
    // Count completed tournaments (for won tournaments - would need more logic for actual wins)
    const completedTournaments = userTournaments.filter(t => t.status === 'completed').length;
    const wonTournaments = Math.floor(completedTournaments * 0.25); // Assuming 25% win rate for demo
    
    res.json({
      user: {
        ...user.toObject(),
        joinedTournaments,
        wonTournaments,
        totalSpent
      },
      recentLogins: user.loginHistory.slice(-5) // Show last 5 logins
    });
  } catch (err) {
    console.error("❌ Profile error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update user profile (protected route)
router.put("/profile", authenticateToken, async (req, res) => {
  try {
    console.log("📝 Profile update request for user:", req.user.id);
    
    const { name, phone, bio, avatar, preferredSports, skillLevel } = req.body;
    
    // Find user and update allowed fields
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Update basic fields
    if (name) user.name = name;
    if (phone) user.phone = phone;
    
    // Initialize profile info if it doesn't exist
    if (!user.profileInfo) {
      user.profileInfo = {};
    }
    
    // Update profile-specific fields
    if (bio !== undefined) user.profileInfo.bio = bio;
    if (avatar !== undefined) user.profileInfo.avatar = avatar;
    if (preferredSports) user.profileInfo.preferredSports = preferredSports;
    if (skillLevel) user.profileInfo.skillLevel = skillLevel;
    
    await user.save();
    
    // Return updated user without password
    const { password: _, ...userWithoutPassword } = user.toObject();
    
    console.log("✅ Profile updated successfully:", req.user.id);
    res.json({ 
      message: "Profile updated successfully", 
      user: userWithoutPassword 
    });
  } catch (err) {
    console.error("❌ Profile update error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Change password (protected route)
router.put("/change-password", authenticateToken, async (req, res) => {
  try {
    console.log("🔒 Password change request for user:", req.user.id);
    
    const { currentPassword, newPassword } = req.body;
    
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ error: "Current and new password are required" });
    }
    
    if (newPassword.length < 6) {
      return res.status(400).json({ error: "New password must be at least 6 characters long" });
    }
    
    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Verify current password
    const validPass = await bcrypt.compare(currentPassword, user.password);
    if (!validPass) {
      return res.status(400).json({ error: "Current password is incorrect" });
    }
    
    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedNewPassword;
    
    await user.save();
    
    console.log("✅ Password changed successfully:", req.user.id);
    res.json({ message: "Password changed successfully" });
  } catch (err) {
    console.error("❌ Password change error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update notification settings (protected route)
router.put("/notifications", authenticateToken, async (req, res) => {
  try {
    console.log("🔔 Notification settings update for user:", req.user.id);
    
    const { tournamentReminders, matchResults, promoOffers, darkMode } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Initialize notification settings if they don't exist
    if (!user.notificationSettings) {
      user.notificationSettings = {};
    }
    
    // Update notification preferences
    if (tournamentReminders !== undefined) user.notificationSettings.tournamentReminders = tournamentReminders;
    if (matchResults !== undefined) user.notificationSettings.matchResults = matchResults;
    if (promoOffers !== undefined) user.notificationSettings.promoOffers = promoOffers;
    if (darkMode !== undefined) user.notificationSettings.darkMode = darkMode;
    
    await user.save();
    
    console.log("✅ Notification settings updated:", req.user.id);
    res.json({ 
      message: "Notification settings updated successfully", 
      settings: user.notificationSettings 
    });
  } catch (err) {
    console.error("❌ Notification settings error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Update payment settings (protected route)
router.put("/payment-settings", authenticateToken, async (req, res) => {
  try {
    console.log("💳 Payment settings update for user:", req.user.id);
    
    const { bankName, accountNumber, swiftBic, paymentMethods } = req.body;
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Initialize payment settings if they don't exist
    if (!user.paymentSettings) {
      user.paymentSettings = {};
    }
    
    // Update payment information
    if (bankName) user.paymentSettings.bankName = bankName;
    if (accountNumber) user.paymentSettings.accountNumber = accountNumber;
    if (swiftBic) user.paymentSettings.swiftBic = swiftBic;
    if (paymentMethods) user.paymentSettings.paymentMethods = paymentMethods;
    
    await user.save();
    
    console.log("✅ Payment settings updated:", req.user.id);
    res.json({ 
      message: "Payment settings updated successfully", 
      settings: user.paymentSettings 
    });
  } catch (err) {
    console.error("❌ Payment settings error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get user's friends/social connections (protected route)
router.get("/friends", authenticateToken, async (req, res) => {
  try {
    console.log("👥 Friends request for user:", req.user.id);
    
    const user = await User.findById(req.user.id)
      .populate('socialConnections.userId', 'name email profileInfo.avatar')
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    const friends = user.socialConnections || [];
    
    res.json({ friends });
  } catch (err) {
    console.error("❌ Friends error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Delete user account (protected route)
router.delete("/delete-account", authenticateToken, async (req, res) => {
  try {
    console.log("🗑️ Account deletion request for user:", req.user.id);
    
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: "Password is required to delete account" });
    }
    
    // Find user
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Verify password
    const validPass = await bcrypt.compare(password, user.password);
    if (!validPass) {
      return res.status(400).json({ error: "Password is incorrect" });
    }
    
    // Instead of deleting, deactivate the account
    user.isActive = false;
    user.deactivatedAt = new Date();
    await user.save();
    
    console.log("✅ Account deactivated:", req.user.id);
    res.json({ message: "Account has been deactivated successfully" });
  } catch (err) {
    console.error("❌ Account deletion error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Upload avatar (protected route)
router.post("/upload-avatar", authenticateToken, async (req, res) => {
  try {
    console.log("📸 Avatar upload request for user:", req.user.id);
    
    const { avatar } = req.body;
    
    if (!avatar) {
      return res.status(400).json({ error: "Avatar data is required" });
    }
    
    const user = await User.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    // Initialize profile info if it doesn't exist
    if (!user.profileInfo) {
      user.profileInfo = {};
    }
    
    user.profileInfo.avatar = avatar;
    await user.save();
    
    console.log("✅ Avatar updated:", req.user.id);
    res.json({ 
      message: "Avatar updated successfully", 
      avatar: user.profileInfo.avatar 
    });
  } catch (err) {
    console.error("❌ Avatar upload error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get user statistics (protected route)
router.get("/stats", authenticateToken, async (req, res) => {
  try {
    console.log("📊 Stats request for user:", req.user.id);
    
    const Tournament = require("../models/Tournament");
    
    // Get tournaments where user is registered
    const userTournaments = await Tournament.find({
      'registeredUsers.userId': req.user.id,
      isActive: true
    });
    
    const totalMatches = userTournaments.length;
    const completedTournaments = userTournaments.filter(t => t.status === 'completed').length;
    const ongoingTournaments = userTournaments.filter(t => t.status === 'ongoing').length;
    const upcomingTournaments = userTournaments.filter(t => t.status === 'upcoming').length;
    
    // Mock some additional stats
    const wins = Math.floor(completedTournaments * 0.65); // 65% win rate
    const goals = Math.floor(totalMatches * 2.3); // Average 2.3 goals per match
    const winRate = totalMatches > 0 ? Math.round((wins / totalMatches) * 100) : 0;
    
    const stats = {
      matches: totalMatches,
      wins: wins,
      goals: goals,
      winRate: winRate,
      completedTournaments,
      ongoingTournaments,
      upcomingTournaments
    };
    
    res.json({ stats });
  } catch (err) {
    console.error("❌ Stats error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Get login history (protected route)
router.get("/login-history", authenticateToken, async (req, res) => {
  try {
    console.log("📊 Login history request for user:", req.user.id);
    
    const user = await User.findById(req.user.id).select('loginHistory loginCount lastLogin');
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }
    
    res.json({
      loginHistory: user.loginHistory,
      totalLogins: user.loginCount,
      lastLogin: user.lastLogin
    });
  } catch (err) {
    console.error("❌ Login history error:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// Logout route (optional - mainly for clearing client-side token)
router.post("/logout", authenticateToken, (req, res) => {
  console.log("👋 Logout request for user:", req.user.id);
  res.json({ message: "Logged out successfully" });
});

// Test route to check database connectivity
router.get("/test-db", async (req, res) => {
  try {
    console.log("🧪 Testing database connection...");
    const userCount = await User.countDocuments();
    const activeUsers = await User.countDocuments({ isActive: true });
    
    console.log("📊 Total users in database:", userCount);
    
    res.json({ 
      message: "Database connected successfully", 
      totalUsers: userCount,
      activeUsers: activeUsers,
      dbName: require('mongoose').connection.db.databaseName
    });
  } catch (err) {
    console.error("❌ Database test error:", err);
    res.status(500).json({ error: err.message });
  }
});

// Middleware to authenticate JWT token
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

  if (!token) {
    return res.status(401).json({ error: "Access token required" });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
    if (err) {
      console.log("❌ Token verification failed:", err.message);
      return res.status(403).json({ error: "Invalid or expired token" });
    }
    
    req.user = user;
    next();
  });
}

module.exports = router;
