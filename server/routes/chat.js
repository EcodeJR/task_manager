const express = require("express")
const ChatMessage = require("../models/ChatMessage")
const auth = require("../middleware/auth")
const router = express.Router()

// Get chat messages for a department
router.get("/department", auth, async (req, res) => {
  try {
    const messages = await ChatMessage.find({ department: req.user.department.id })
      .populate("sender", "name email role department")
      .sort({ timestamp: 1 })

    res.json(messages)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Send a new message
router.post("/", auth, async (req, res) => {
  try {
    const { content } = req.body

    const message = new ChatMessage({
      content,
      sender: req.user.id,
      department: req.user.department.id,
    })

    await message.save()

    // Populate the sender field for the response
    const populatedMessage = await ChatMessage.findById(message._id).populate("sender", "name email role department")

    res.status(201).json(populatedMessage)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
