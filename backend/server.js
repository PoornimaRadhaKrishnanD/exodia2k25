const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Groq = require("groq-sdk"); // 🆕 Add Groq SDK for chatbot
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
// Groq AI Setup for Chatbot
// =====================
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

// ✅ Website routes mapping for chatbot
const pageLinks = {
  login: "/login",
  registration: "/register",
  signup: "/register",
  schedule: "/schedule",
  payment: "/payment",
  home: "/",
  dashboard: "/dashboard",
  tournaments: "/tournaments",
  profile: "/profile"
};

// Function to check if message is about a page
function findLink(userMessage) {
  const lowerMsg = userMessage.toLowerCase();
  for (let key in pageLinks) {
    if (lowerMsg.includes(key)) {
      return pageLinks[key];
    }
  }
  return null;
}

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

// =====================
// 🤖 Chatbot Routes
// =====================
app.post("/api/chatbot/groq-chat", async (req, res) => {
  try {
    const { message } = req.body;

    if (!message) {
      return res.status(400).json({ 
        success: false, 
        error: "Message is required" 
      });
    }

    console.log("🤖 Chatbot query:", message);

    // Check if it's a direct page query
    const link = findLink(message);
    if (link) {
      console.log("🔗 Found page link:", link);
      return res.json({
        success: true,
        response: `🔗 You can access the **${link.replace("/", "") || "home"} page** here: <a href="${link}" class="text-blue-600 underline hover:text-blue-800">${link}</a>`,
      });
    }

    // Otherwise, query Groq AI
    const completion = await groq.chat.completions.create({
      messages: [
        {
          role: "system",
          content: `You are Tournament Pro Assistant for PlaySwiftPay platform. 
          You only answer questions related to tournaments, sports events, registration, schedules, login, organizers, payments, and general tournament queries. 
          Always be concise, helpful, and friendly. Use emojis appropriately.
          If someone asks about features not related to tournaments, politely redirect them to tournament-related topics.
          Available pages: login, registration, schedule, payment, dashboard, tournaments, profile.`,
        },
        { role: "user", content: message },
      ],
      model: "llama-3.3-70b-versatile",
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0].message.content;
    console.log("🤖 AI Response generated");

    res.json({
      success: true,
      response: response,
    });
  } catch (error) {
    console.error("❌ Chatbot Error:", error.message);
    res.status(500).json({ 
      success: false, 
      error: "Sorry, I'm having trouble right now. Please try again later." 
    });
  }
});

// =====================
// Tournament & User Routes
// =====================

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
