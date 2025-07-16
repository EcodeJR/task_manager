const mongoose = require("mongoose")

const NotificationSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ["info", "success", "warning", "error"],
    default: "info",
  },
  message: {
    type: String,
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  read: {
    type: Boolean,
    default: false,
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
})

module.exports = mongoose.model("Notification", NotificationSchema)
