const express = require("express")
const Notification = require("../models/Notification")
const User = require("../models/User")
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

// Get all notifications for the user's department
router.get("/department", auth, async (req, res) => {
  try {
    const departmentId = req.user.department.id
    // Get both department-wide notifications (no userId) and user-specific notifications for this department
    const notifications = await Notification.find({ 
      departmentId,
      $or: [
        { userId: { $exists: false } }, // Department-wide notifications
        { userId: req.user.id }         // User-specific notifications
      ]
    }).sort({ timestamp: -1 })
    res.json(notifications)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create a new notification
// If userId is provided, send to that user only; otherwise, send to all department members
router.post("/", auth, async (req, res) => {
  try {
    const { type, message, userId, departmentId } = req.body
    let notifications = []

    if (userId) {
      // Send to a single user
      const notification = new Notification({
        type,
        message,
        userId,
        departmentId: departmentId || req.user.department.id,
        createdBy: req.user.name
      })
      await notification.save()
      notifications.push(notification)
    } else {
      // Send to all members in the department (create one shared notification)
      const deptId = departmentId || req.user.department.id
      const notification = new Notification({
        type,
        message,
        departmentId: deptId,
        createdBy: req.user.name
      })
      await notification.save()
      notifications.push(notification)
    }
    res.status(201).json(notifications)
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

    // Mark as read for this user only
    if (!notification.readBy) notification.readBy = [];
    if (!notification.readBy.map(id => id.toString()).includes(req.user.id)) {
      notification.readBy.push(req.user.id);
      await notification.save();
    }

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
