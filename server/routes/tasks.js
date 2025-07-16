const express = require("express")
const Task = require("../models/Task")
const auth = require("../middleware/auth")
const router = express.Router()

// Get all tasks for a department
router.get("/department/:departmentId", auth, async (req, res) => {
  try {
    const tasks = await Task.find({ department: req.params.departmentId })
      .populate("addedBy", "name email role department")
      .sort({ createdAt: -1 })

    res.json(tasks)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Create a new task
router.post("/", auth, async (req, res) => {
  try {
    const { title, description, department, urgency, dueDate } = req.body

    const task = new Task({
      title,
      description,
      addedBy: req.user.id,
      department,
      urgency,
      dueDate,
    })

    await task.save()

    // Populate the addedBy field for the response
    const populatedTask = await Task.findById(task._id).populate("addedBy", "name email role department")

    res.status(201).json(populatedTask)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Update a task
router.put("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)

    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    // Update fields
    const { title, description, urgency, dueDate, completed } = req.body

    if (title) task.title = title
    if (description) task.description = description
    if (urgency) task.urgency = urgency
    if (dueDate) task.dueDate = dueDate
    if (completed !== undefined) task.completed = completed

    await task.save()

    // Populate the addedBy field for the response
    const populatedTask = await Task.findById(task._id).populate("addedBy", "name email role department")

    res.json(populatedTask)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete a task
router.delete("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)

    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    // Only admins can delete tasks
    if (req.user.role !== "admin") {
      return res.status(403).json({ message: "Not authorized" })
    }

    await Task.deleteOne({ _id: task._id })

    res.json({ message: "Task removed" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get expiring soon tasks
router.get("/expiring-soon", auth, async (req, res) => {
  try {
    const now = new Date()
    const fourHoursFromNow = new Date(now.getTime() + 4 * 60 * 60 * 1000)

    const tasks = await Task.find({
      completed: false,
      dueDate: { $gt: now, $lt: fourHoursFromNow },
      department: req.user.department.id,
    }).populate("addedBy", "name email role department")

    res.json(tasks)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

module.exports = router
