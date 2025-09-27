const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");

const router = express.Router();

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

    // Don't send password back in response
    const { password: _, ...userWithoutPassword } = savedUser.toObject();
    res.status(201).json({ 
      message: "User registered successfully", 
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
    
    res.json({
      user: user,
      recentLogins: user.loginHistory.slice(-5) // Show last 5 logins
    });
  } catch (err) {
    console.error("❌ Profile error:", err);
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
