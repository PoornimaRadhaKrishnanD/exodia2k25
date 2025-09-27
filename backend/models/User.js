const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true }, // hashed
  role: { type: String, enum: ["user", "admin", "organizer"], default: "user" },
  
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
  loginHistory: [{
    loginTime: { type: Date, default: Date.now },
    ipAddress: String,
    userAgent: String,
    success: { type: Boolean, default: true }
  }]
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
