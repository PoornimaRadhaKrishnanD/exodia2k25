const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: { type: String },
  password: { type: String, required: true }, // hashed
  role: { type: String, enum: ["user", "admin"], default: "user" },
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
