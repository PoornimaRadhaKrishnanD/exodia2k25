const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();

// =====================
// Middleware
// =====================
app.use(cors());
app.use(express.json());

// Trust proxy to get real IP addresses
app.set('trust proxy', true);

// =====================
// MongoDB Connection
// =====================
mongoose.connect(process.env.MONGO_URI)
.then(() => {
    console.log("✅ MongoDB connected successfully");
    console.log("📍 Database:", mongoose.connection.db.databaseName);
    console.log("🔗 Connection URL:", process.env.MONGO_URI.replace(/:[^:@]*@/, ':****@'));
})
.catch(err => {
    console.error("❌ MongoDB connection error:", err);
    process.exit(1);
});

// Handle MongoDB connection events
mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
});

mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected');
});

mongoose.connection.on('reconnected', () => {
    console.log('🔄 MongoDB reconnected');
});

// =====================
// Import Routes
// =====================
const tournamentRoutes = require("./routes/tournament");
const authRoutes = require("./routes/auth");   // 🆕 add auth route
const adminRoutes = require("./routes/admin"); // 🆕 add admin route
const registrationRoutes = require("./routes/registrations"); // 🆕 add registration routes
const organizerRoutes = require("./routes/organizer"); // 🆕 add organizer routes

// =====================
// Routes
// =====================
app.get("/", (req, res) => {
    res.send("🎯 Tournament Backend is running!");
});

app.use("/api/tournaments", tournamentRoutes);
app.use("/api/auth", authRoutes);  // 🆕 register & login routes
app.use("/api/admin", adminRoutes); // 🆕 admin dashboard routes
app.use("/api/registrations", registrationRoutes); // 🆕 detailed registration routes
app.use("/api/organizer", organizerRoutes); // 🆕 organizer dashboard routes

// =====================
// Server
// =====================
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
