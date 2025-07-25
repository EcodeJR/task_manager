"use client"

import React from "react";
import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./auth-context"
import api from "./api"

const NotificationContext = createContext(undefined)

export function NotificationProvider({ children }) {
  const [notifications, setNotifications] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  // Fetch all department notifications
  const fetchDepartmentNotifications = React.useCallback(async () => {
    if (!user) {
      setNotifications([])
      setLoading(false)
      return
    }
    try {
      setLoading(true)
      const res = await api.get("/notifications/department")
      const formattedNotifications = res.data.map((notification) => ({
        ...notification,
        id: notification._id,
        timestamp: new Date(notification.timestamp),
      }))
      setNotifications(formattedNotifications)
    } catch (error) {
      console.error("Error fetching department notifications:", error)
    } finally {
      setLoading(false)
    }
  }, [user])

  // By default, fetch department notifications
  useEffect(() => {
    fetchDepartmentNotifications()
  }, [user])

  // By default, send to all department members unless userId is specified
  const addNotification = async (notification) => {
    try {
      let res
      if (!notification.userId) {
        // Send to all department members
        res = await api.post("/notifications", { ...notification, departmentId: user?.department?.id })
        // res.data is an array of notifications
        const newNotifications = res.data.map((notif) => ({
          ...notif,
          id: notif._id,
          timestamp: new Date(notif.timestamp),
        }))
        setNotifications((prev) => [...prev, ...newNotifications])
        return newNotifications
      } else {
        // Send to a single user
        res = await api.post("/notifications", notification)
        const newNotification = {
          ...res.data,
          id: res.data._id,
          timestamp: new Date(res.data.timestamp),
        }
        setNotifications((prev) => [...prev, newNotification])
        return newNotification
      }
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
      setNotifications((prev) => prev.map((notif) => {
        if (!notif.readBy) notif.readBy = [];
        if (!notif.readBy.map(id => id.toString()).includes(user.id.toString())) {
          return { ...notif, readBy: [...notif.readBy, user.id] };
        }
        return notif;
      }))
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
      throw error
    }
  }

  // Get all department notifications
  const getDepartmentNotifications = () => {
    if (!user) return []
    return notifications
      .filter((notif) => notif.departmentId === user.department.id)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  // Get unread count for the department
  const getDepartmentUnreadCount = () => {
    if (!user) return 0
    return notifications.filter((notif) =>
      notif.departmentId === user.department.id &&
      !(notif.readBy && notif.readBy.map(id => id.toString()).includes(user.id.toString()))
    ).length
  }

  // Retain user-specific helpers for compatibility
  const getUserNotifications = (userId) => {
    return notifications
      .filter((notif) => notif.userId === userId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
  }

  const getUnreadCount = (userId) => {
    return notifications.filter((notif) =>
      notif.userId === userId &&
      !(notif.readBy && notif.readBy.map(id => id.toString()).includes(userId.toString()))
    ).length
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
        fetchDepartmentNotifications,
        getDepartmentNotifications,
        getDepartmentUnreadCount,
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
