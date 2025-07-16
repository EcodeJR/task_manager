const express = require("express")
const Notification = require("../models/Notification")
const auth = require("../middleware/auth")
const router = express.Router()

// Get notifications for a user
router.get("/user", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ userId: req.user.id }).sort({ timestamp: -1 })

    res.json(notifications)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create a new notification
router.post("/", auth, async (req, res) => {
  try {
    const { type, message, userId } = req.body

    const notification = new Notification({
      type,
      message,
      userId,
    })

    await notification.save()

    res.status(201).json(notification)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Mark notification as read
router.put("/:id/read", auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id)

    if (!notification) {
      return res.status(404).json({ message: "Notification not found" })
    }

    // Ensure user can only mark their own notifications as read
    if (notification.userId.toString() !== req.user.id) {
      return res.status(403).json({ message: "Not authorized" })
    }

    notification.read = true
    await notification.save()

    res.json(notification)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Mark all notifications as read
router.put("/read-all", auth, async (req, res) => {
  try {
    await Notification.updateMany({ userId: req.user.id, read: false }, { $set: { read: true } })

    res.json({ message: "All notifications marked as read" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
