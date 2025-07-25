const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const dotenv = require("dotenv")
const path = require("path")
const authRoutes = require("./routes/auth")
const taskRoutes = require("./routes/tasks")
const notificationRoutes = require("./routes/notifications")
const chatRoutes = require("./routes/chat")
const userRoutes = require("./routes/users")

// Load environment variables
dotenv.config()

const app = express()
const PORT = process.env.PORT || 5000

// Scheduled jobs
require("./jobs/taskNotifications")

// Middleware
// Set CORS origin from .env (CLIENT_ORIGIN)
// Allow multiple origins for CORS (comma-separated in CLIENT_ORIGIN)
const allowedOrigins = [
  process.env.NODE_ENV === "development" ? "http://localhost:3000" : process.env.CLIENT_ORIGIN,
].filter(Boolean);
console.log("Allowed origins:", allowedOrigins);
app.use(cors({
  origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
          callback(null, true);
      } else {
          callback(new Error('Not allowed by CORS'));
      }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));
app.use(express.json())

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => console.log("Connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err))

// Routes
app.use("/api/auth", authRoutes)
app.use("/api/tasks", taskRoutes)
app.use("/api/notifications", notificationRoutes)
app.use("/api/chat", chatRoutes)
app.use("/api/users", userRoutes)

// Serve static files from React build in production
// Only serve static files in production if you deploy client+server together
if (process.env.NODE_ENV === "production" && process.env.SERVE_CLIENT === "true") {
  app.use(express.static(path.join(__dirname, "../client/build")))
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../client/build", "index.html"))
  })
}

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})
