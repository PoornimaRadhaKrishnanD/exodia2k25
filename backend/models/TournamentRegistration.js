const mongoose = require("mongoose");

const TournamentRegistrationSchema = new mongoose.Schema({
  // Tournament and User References
  tournamentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Tournament',
    required: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  
  // Registration Status
  registrationDate: {
    type: Date,
    default: Date.now
  },
  paymentStatus: {
    type: String,
    enum: ["pending", "completed", "failed", "refunded"],
    default: "pending"
  },
  transactionId: {
    type: String,
    trim: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  
  // Personal Information
  personalInfo: {
    fullName: {
      type: String,
      required: true,
      trim: true
    },
    email: {
      type: String,
      required: true,
      lowercase: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    dateOfBirth: {
      type: Date,
      required: true
    },
    gender: {
      type: String,
      required: true,
      enum: ["male", "female", "other", "prefer-not-to-say"]
    }
  },
  
  // Address Information
  addressInfo: {
    address: {
      type: String,
      required: true,
      trim: true
    },
    city: {
      type: String,
      required: true,
      trim: true
    },
    state: {
      type: String,
      required: true,
      trim: true
    },
    zipCode: {
      type: String,
      required: true,
      trim: true
    },
    country: {
      type: String,
      required: true,
      default: "India",
      trim: true
    }
  },
  
  // Emergency Contact
  emergencyContact: {
    name: {
      type: String,
      required: true,
      trim: true
    },
    phone: {
      type: String,
      required: true,
      trim: true
    },
    relation: {
      type: String,
      required: true,
      enum: ["parent", "spouse", "sibling", "friend", "guardian", "other"]
    }
  },
  
  // Sports/Tournament Specific Information
  sportsInfo: {
    experience: {
      type: String,
      enum: ["beginner", "intermediate", "advanced", "professional"],
      default: "beginner"
    },
    previousTournaments: {
      type: String,
      trim: true
    },
    medicalConditions: {
      type: String,
      trim: true
    },
    specialRequirements: {
      type: String,
      trim: true
    },
    dietaryRestrictions: {
      type: String,
      trim: true
    }
  },
  
  // Additional Information
  additionalInfo: {
    howDidYouHear: {
      type: String,
      enum: ["social-media", "friends", "website", "advertisement", "sports-club", "search-engine", "other"]
    },
    additionalComments: {
      type: String,
      trim: true
    },
    tshirtSize: {
      type: String,
      enum: ["XS", "S", "M", "L", "XL", "XXL"],
      default: "M"
    }
  },
  
  // Payment Information
  paymentInfo: {
    paymentMethod: {
      type: String,
      required: true,
      enum: ["card", "upi", "netbanking", "wallet", "cash"]
    },
    amountPaid: {
      type: Number,
      min: 0
    },
    paymentDate: {
      type: Date
    },
    refundAmount: {
      type: Number,
      default: 0,
      min: 0
    },
    refundDate: {
      type: Date
    }
  },
  
  // Legal and Compliance
  agreements: {
    termsAndConditions: {
      type: Boolean,
      required: true,
      default: false
    },
    privacyPolicy: {
      type: Boolean,
      default: true
    },
    marketingConsent: {
      type: Boolean,
      default: false
    },
    photoConsent: {
      type: Boolean,
      default: false
    }
  },
  
  // Tournament Specific Data
  tournamentData: {
    category: {
      type: String,
      trim: true
    },
    division: {
      type: String,
      trim: true
    },
    teamName: {
      type: String,
      trim: true
    },
    jerseyNumber: {
      type: Number,
      min: 1
    }
  },
  
  // Status and Tracking
  status: {
    registrationStatus: {
      type: String,
      enum: ["pending", "confirmed", "waitlisted", "cancelled", "completed"],
      default: "pending"
    },
    checkInStatus: {
      type: String,
      enum: ["not-checked-in", "checked-in", "no-show"],
      default: "not-checked-in"
    },
    checkInTime: {
      type: Date
    },
    lastModified: {
      type: Date,
      default: Date.now
    }
  },
  
  // Admin Notes
  adminNotes: [{
    note: {
      type: String,
      required: true
    },
    addedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    addedAt: {
      type: Date,
      default: Date.now
    }
  }]
  
}, { 
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
TournamentRegistrationSchema.index({ tournamentId: 1, userId: 1 }, { unique: true });
TournamentRegistrationSchema.index({ tournamentId: 1 });
TournamentRegistrationSchema.index({ userId: 1 });
TournamentRegistrationSchema.index({ registrationDate: -1 });
TournamentRegistrationSchema.index({ paymentStatus: 1 });
TournamentRegistrationSchema.index({ 'status.registrationStatus': 1 });

// Virtual for full name display
TournamentRegistrationSchema.virtual('displayName').get(function() {
  return this.personalInfo.fullName;
});

// Virtual for contact info
TournamentRegistrationSchema.virtual('contactInfo').get(function() {
  return {
    email: this.personalInfo.email,
    phone: this.personalInfo.phone
  };
});

// Pre-save middleware to update lastModified
TournamentRegistrationSchema.pre('save', function(next) {
  this.status.lastModified = new Date();
  next();
});

// Static method to find registrations by tournament
TournamentRegistrationSchema.statics.findByTournament = function(tournamentId) {
  return this.find({ tournamentId })
    .populate('userId', 'name email phone')
    .populate('tournamentId', 'name type date')
    .sort({ registrationDate: -1 });
};

// Static method to find registrations by user
TournamentRegistrationSchema.statics.findByUser = function(userId) {
  return this.find({ userId })
    .populate('tournamentId', 'name type date status')
    .sort({ registrationDate: -1 });
};

// Instance method to mark as paid
TournamentRegistrationSchema.methods.markAsPaid = function(transactionId, amount) {
  this.paymentStatus = 'completed';
  this.transactionId = transactionId;
  this.paymentInfo.amountPaid = amount;
  this.paymentInfo.paymentDate = new Date();
  this.status.registrationStatus = 'confirmed';
  return this.save();
};

// Instance method to cancel registration
TournamentRegistrationSchema.methods.cancelRegistration = function(reason) {
  this.status.registrationStatus = 'cancelled';
  this.isActive = false;
  if (reason) {
    this.adminNotes.push({
      note: `Registration cancelled: ${reason}`,
      addedBy: this.userId,
      addedAt: new Date()
    });
  }
  return this.save();
};

module.exports = mongoose.model("TournamentRegistration", TournamentRegistrationSchema);