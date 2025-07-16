"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./auth-context"
import api from "./api"

const NotificationContext = createContext(undefined)

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchNotifications = async () => {
    if (!user) {
      setNotifications([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const res = await api.get("/notifications/user")

      const formattedNotifications = res.data.map((notification) => ({
        ...notification,
        id: notification._id,
        timestamp: new Date(notification.timestamp),
      }))

      setNotifications(formattedNotifications)
    } catch (error) {
      console.error("Error fetching notifications:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchNotifications()
  }, [user])

  const addNotification = async (notification) => {
    try {
      const res = await api.post("/notifications", notification)

      const newNotification = {
        ...res.data,
        id: res.data._id,
        timestamp: new Date(res.data.timestamp),
      }

      setNotifications((prev) => [...prev, newNotification])
      return newNotification
    } catch (error) {
      console.error("Error adding notification:", error)
      throw error
    }
  }

  const markAsRead = async (id) => {
    try {
      const res = await api.put(`/notifications/${id}/read`)

      const updatedNotification = {
        ...res.data,
        id: res.data._id,
        timestamp: new Date(res.data.timestamp),
      }

      setNotifications((prev) => prev.map((notif) => (notif.id === id ? updatedNotification : notif)))
    } catch (error) {
      console.error("Error marking notification as read:", error)
      throw error
    }
  }

  const markAllAsRead = async () => {
    try {
      await api.put("/notifications/read-all")
      setNotifications((prev) => prev.map((notif) => ({ ...notif, read: true })))
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      throw error
    }
  }

  const getUserNotifications = (userId) => {
    return notifications
      .filter((notif) => notif.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  const getUnreadCount = (userId) => {
    return notifications.filter((notif) => notif.userId === userId && !notif.read).length
  }

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        loading,
        addNotification,
        markAsRead,
        markAllAsRead,
        getUserNotifications,
        getUnreadCount,
        fetchNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export function useNotifications() {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotifications must be used within a NotificationProvider")
  }
  return context
}
