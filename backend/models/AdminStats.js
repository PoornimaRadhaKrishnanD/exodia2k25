const mongoose = require("mongoose");

const adminStatsSchema = new mongoose.Schema({
  totalTournaments: {
    type: Number,
    default: 0
  },
  activeTournaments: {
    type: Number,
    default: 0
  },
  completedTournaments: {
    type: Number,
    default: 0
  },
  upcomingTournaments: {
    type: Number,
    default: 0
  },
  totalUsers: {
    type: Number,
    default: 0
  },
  activeUsers: {
    type: Number,
    default: 0
  },
  totalRevenue: {
    type: Number,
    default: 0
  },
  thisMonthRevenue: {
    type: Number,
    default: 0
  },
  lastMonthRevenue: {
    type: Number,
    default: 0
  },
  averageParticipants: {
    type: Number,
    default: 0
  },
  totalRegistrations: {
    type: Number,
    default: 0
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  },
  monthlyStats: [{
    month: {
      type: String,
      required: true
    },
    year: {
      type: Number,
      required: true
    },
    revenue: {
      type: Number,
      default: 0
    },
    tournaments: {
      type: Number,
      default: 0
    },
    registrations: {
      type: Number,
      default: 0
    }
  }]
}, { 
  timestamps: true 
});

// Index for better performance
adminStatsSchema.index({ lastUpdated: 1 });

module.exports = mongoose.model("AdminStats", adminStatsSchema);