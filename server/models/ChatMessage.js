const mongoose = require("mongoose")

const ChatMessageSchema = new mongoose.Schema({
  content: {
    type: String,
    required: true,
  },
  sender: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  department: {
    type: String,
    required: true,
  },
})

module.exports = mongoose.model("ChatMessage", ChatMessageSchema)
