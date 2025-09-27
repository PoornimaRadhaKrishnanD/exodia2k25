const mongoose = require("mongoose");

const TournamentSchema = new mongoose.Schema({
  name: { 
    type: String, 
    required: true,
    trim: true 
  },
  type: { 
    type: String, 
    required: true,
    enum: ["Cricket", "Football", "Basketball", "Tennis", "Volleyball", "Badminton", "Other"]
  },
  status: { 
    type: String, 
    required: true,
    enum: ["upcoming", "ongoing", "completed", "cancelled"],
    default: "upcoming"
  },
  date: { 
    type: Date, 
    required: true 
  },
  endDate: {
    type: Date
  },
  participants: { 
    type: Number, 
    default: 0,
    min: 0
  },
  maxParticipants: { 
    type: Number, 
    required: true,
    min: 1
  },
  entryFee: { 
    type: Number, 
    required: true,
    min: 0
  },
  totalRevenue: { 
    type: Number, 
    default: 0,
    min: 0
  },
  description: {
    type: String,
    trim: true
  },
  location: {
    type: String,
    trim: true
  },
  rules: [{
    type: String,
    trim: true
  }],
  prizes: [{
    position: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true,
      min: 0
    }
  }],
  registeredUsers: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    registrationDate: {
      type: Date,
      default: Date.now
    },
    paymentStatus: {
      type: String,
      enum: ["pending", "completed", "failed"],
      default: "pending"
    },
    transactionId: String
  }],
  organizer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  }
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual for calculating revenue
TournamentSchema.virtual('calculatedRevenue').get(function() {
  return this.participants * this.entryFee;
});

// Update total revenue before saving
TournamentSchema.pre('save', function(next) {
  if (this.isModified('participants') || this.isModified('entryFee')) {
    this.totalRevenue = this.participants * this.entryFee;
  }
  next();
});

// Index for better query performance
TournamentSchema.index({ status: 1, date: 1 });
TournamentSchema.index({ organizer: 1 });

module.exports = mongoose.model("Tournament", TournamentSchema);
