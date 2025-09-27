const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true }, // hashed
  role: { type: String, enum: ["user", "admin", "organizer"], default: "user" },
  
  // Profile information
  profileInfo: {
    avatar: { type: String },
    bio: { type: String, maxlength: 500 },
    preferredSports: [{ type: String }],
    skillLevel: { type: String, enum: ["Beginner", "Intermediate", "Advanced"], default: "Beginner" },
    teams: [{
      name: { type: String },
      role: { type: String },
      joinDate: { type: Date, default: Date.now }
    }],
    achievements: [{ type: String }],
    isPhoneVerified: { type: Boolean, default: false }
  },
  
  // Notification settings
  notificationSettings: {
    tournamentReminders: { type: Boolean, default: true },
    matchResults: { type: Boolean, default: true },
    promoOffers: { type: Boolean, default: false },
    darkMode: { type: Boolean, default: false },
    language: { type: String, default: "english" }
  },
  
  // Payment settings
  paymentSettings: {
    bankName: { type: String },
    accountNumber: { type: String },
    swiftBic: { type: String },
    paymentMethods: [{
      type: { type: String }, // "credit", "debit", "upi"
      last4Digits: { type: String },
      isDefault: { type: Boolean, default: false },
      addedAt: { type: Date, default: Date.now }
    }]
  },
  
  // Social connections
  socialConnections: [{
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    status: { type: String, enum: ["pending", "accepted", "blocked"], default: "pending" },
    connectedAt: { type: Date, default: Date.now }
  }],
  
  // Organizer-specific fields
  organizerInfo: {
    organizationName: { type: String },
    experience: { type: Number, default: 0 }, // years of experience
    specialization: [{ type: String }], // ["Cricket", "Football", etc.]
    verificationStatus: { type: String, enum: ["pending", "verified", "rejected"], default: "pending" },
    verificationDate: { type: Date },
    rating: { type: Number, default: 0 },
    totalTournaments: { type: Number, default: 0 },
    bio: { type: String, maxlength: 500 }
  },
  
  lastLogin: { type: Date },
  loginCount: { type: Number, default: 0 },
  isActive: { type: Boolean, default: true },
  deactivatedAt: { type: Date },
  loginHistory: [{
    loginTime: { type: Date, default: Date.now },
    ipAddress: String,
    userAgent: String,
    success: { type: Boolean, default: true }
  }]
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
