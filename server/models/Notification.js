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
  readBy: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },
  departmentId: {
    type: String,
    required: true,
  },
  createdBy: {
    type: String,
    required: true
  },
  taskId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Task",
    required: false,
  },
  notifType: {
    type: String,
    required: false,
  },
})

module.exports = mongoose.model("Notification", NotificationSchema)
