const cron = require('node-cron');
const mongoose = require('mongoose');
const Task = require('../models/Task');
const Notification = require('../models/Notification');

// Run every hour at minute 0
cron.schedule('0 * * * *', async () => {
  console.log('[Task Notification Job] Running...');
  try {
    // Find tasks that are not completed, due within 24 hours, or are critical
    const now = new Date();
    const soon = new Date(now.getTime() + 24 * 60 * 60 * 1000);
    const tasks = await Task.find({
      completed: false,
      $or: [
        { dueDate: { $lte: soon, $gte: now } },
        { urgency: 'critical' }
      ]
    });
    for (const task of tasks) {
      // Check if a notification for this task/due/critical event already exists
      const existing = await Notification.findOne({
        'taskId': task._id,
        $or: [
          { type: 'due_soon' },
          { type: 'critical' }
        ],
        message: { $regex: task.title, $options: 'i' },
        departmentId: task.department
      });
      if (existing) continue;
      // Compose message
      let type = 'info';
      let notifType = '';
      let message = '';
      if (task.urgency === 'critical') {
        type = 'error';
        notifType = 'critical';
        message = `Critical Task: "${task.title}" requires immediate attention!`;
      } else {
        type = 'warning';
        notifType = 'due_soon';
        const due = task.dueDate.toLocaleString();
        message = `Task "${task.title}" is due soon: ${due}`;
      }
      // Create department notification
      await Notification.create({
        type,
        message,
        departmentId: task.department,
        createdBy: 'system',
        taskId: task._id,
        notifType
      });
      // Send browser push notification to all department users with pushSubscription
      try {
        const User = require('../models/User');
        const webpush = require('../utils/push');
        const users = await User.find({ department: task.department, pushSubscription: { $exists: true, $ne: null } });
        for (const user of users) {
          try {
            await webpush.sendNotification(user.pushSubscription, JSON.stringify({
              title: notifType === 'critical' ? 'Critical Task Alert' : 'Task Due Soon',
              body: message,
              url: '/dashboard/tasks',
              taskId: task._id
            }));
          } catch (err) {
            console.error(`[Task Notification Job] Web push failed for user ${user._id}:`, err.message);
          }
        }
      } catch (err) {
        console.error('[Task Notification Job] Error sending browser push:', err);
      }
      console.log(`[Task Notification Job] Notification sent for task: ${task.title}`);
    }
  } catch (err) {
    console.error('[Task Notification Job] Error:', err);
  }
});

// Export for manual triggering/testing
module.exports = {};
