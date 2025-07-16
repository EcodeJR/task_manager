"use client"

import { useState, useEffect, useRef } from "react"
import { Alert, AlertDescription, AlertTitle } from "./ui/alert"
import { useAuth } from "../lib/auth-context"
import { useNotifications } from "../lib/notification-context"
import { useTasks } from "../lib/task-context"
import { AlertTriangle } from "lucide-react"

export default function TaskExpirationAlert() {
  const { user } = useAuth()
  const { getExpiringSoonTasks } = useTasks()
  const { addNotification } = useNotifications()
  const [expiringSoonTasks, setExpiringSoonTasks] = useState([])

  // Use useRef to maintain a persistent reference to notified task IDs
  const notifiedTaskIdsRef = useRef(new Set())

  // Use another ref to track if we've done the initial check
  const initialCheckDoneRef = useRef(false)

  useEffect(() => {
    // Function to check for expiring tasks
    const checkExpiringTasks = () => {
      const tasks = getExpiringSoonTasks()
      setExpiringSoonTasks(tasks)

      // Only send notifications if we have a user and there are expiring tasks
      if (user) {
        tasks.forEach((task) => {
          // Only notify about tasks we haven't notified about yet
          if (!notifiedTaskIdsRef.current.has(task.id)) {
            notifiedTaskIdsRef.current.add(task.id)

            // Only add notification if this isn't the initial check
            if (initialCheckDoneRef.current) {
              addNotification({
                type: "warning",
                message: `Task "${task.title}" is expiring soon`,
                userId: user.id,
              })
            }
          }
        })
      }

      // Mark initial check as done
      initialCheckDoneRef.current = true
    }

    // Do initial check
    checkExpiringTasks()

    // Set up interval for subsequent checks
    const interval = setInterval(checkExpiringTasks, 60000)

    return () => clearInterval(interval)
  }, [])

  // Separate effect to handle user changes
  useEffect(() => {
    if (!user) {
      // Clear tasks when user changes/logs out
      setExpiringSoonTasks([])
    } else {
      // Update tasks when user changes
      setExpiringSoonTasks(getExpiringSoonTasks())
    }
  }, [user, getExpiringSoonTasks])

  if (expiringSoonTasks.length === 0) {
    return null
  }

  return (
    <Alert variant="warning" className="mb-6">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Attention needed</AlertTitle>
      <AlertDescription>
        {expiringSoonTasks.length === 1 ? (
          <>
            The task <strong>{expiringSoonTasks[0].title}</strong> is expiring soon.
          </>
        ) : (
          <>
            You have <strong>{expiringSoonTasks.length} tasks</strong> that are expiring soon.
          </>
        )}
      </AlertDescription>
    </Alert>
  )
}
