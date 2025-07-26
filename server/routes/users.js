const express = require("express")
const User = require("../models/User")
const auth = require("../middleware/auth")
const adminAuth = require("../middleware/adminAuth")
const router = express.Router()

// Get users in the same department
router.get("/department", auth, async (req, res) => {
  try {
    const users = await User.find({ "department.id": req.user.department.id }).select("-password").sort({ name: 1 })

    res.json(users)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Promote a staff user to admin (admin only)
router.put('/:id/promote', [auth, adminAuth], async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }
    if (user.role === 'admin') {
      return res.status(400).json({ message: 'User is already an admin' });
    }
    user.role = 'admin';
    user.approved = true;
    await user.save();
    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      approved: user.approved,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error' });
  }
});

// Approve a user (admin only)
router.put("/:id/approve", [auth, adminAuth], async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Ensure admin can only approve users in their department
    if (user.department.id !== req.user.department.id) {
      return res.status(403).json({ message: "Not authorized to approve users outside your department" })
    }

    user.approved = true
    await user.save()

    res.json({
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      department: user.department,
      approved: user.approved,
    })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Delete a user (admin only)
router.delete("/:id", [auth, adminAuth], async (req, res) => {
  try {
    const user = await User.findById(req.params.id)

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    // Ensure admin can only delete users in their department
    if (user.department.id !== req.user.department.id) {
      return res.status(403).json({ message: "Not authorized to delete users outside your department" })
    }

    // Prevent admin from deleting themselves
    if (user._id.toString() === req.user.id) {
      return res.status(400).json({ message: "Cannot delete your own account" })
    }

    await User.deleteOne({ _id: user._id })

    res.json({ message: "User removed" })
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Get all departments
router.get("/departments", auth, async (req, res) => {
  try {
    // Get unique departments from users
    const departments = await User.aggregate([
      { $group: { _id: "$department.id", name: { $first: "$department.name" } } },
      { $project: { _id: 0, id: "$_id", name: 1 } },
    ])

    res.json(departments)
  } catch (error) {
    console.error(error)
    res.status(500).json({ message: "Server error" })
  }
})

// Save browser push subscription for the current user
router.post('/push-subscription', auth, async (req, res) => {
  try {
    req.user.pushSubscription = req.body.subscription;
    await req.user.save();
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router
