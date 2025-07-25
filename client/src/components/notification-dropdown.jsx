"use client"

import { useRef, useEffect } from "react"
import { Button } from "./ui/button"
import { ScrollArea } from "./ui/scroll-area"
import { useAuth } from "../lib/auth-context"
import { useNotifications } from "../lib/notification-context"
import { CheckCheck, Info, AlertTriangle, AlertCircle } from "lucide-react"

export default function NotificationDropdown({ onClose }) {
  const { user } = useAuth()
  const { getDepartmentNotifications, getDepartmentUnreadCount, markAllAsRead, markAsRead } = useNotifications()
  const dropdownRef = useRef(null)

  const notifications = user ? getDepartmentNotifications() : []
  const unreadCount = user ? getDepartmentUnreadCount() : 0;

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        onClose()
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [onClose])

  const getNotificationIcon = (type) => {
    switch (type) {
      case "info":
        return <Info className="h-4 w-4 text-blue-500" />
      case "success":
        return <CheckCheck className="h-4 w-4 text-green-500" />
      case "warning":
        return <AlertTriangle className="h-4 w-4 text-amber-500" />
      case "error":
        return <AlertCircle className="h-4 w-4 text-red-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
    }
  }

  const formatTime = (date) => {
    const now = new Date()
    const diff = now.getTime() - date.getTime()

    if (diff < 60000) {
      return "Just now"
    } else if (diff < 3600000) {
      return `${Math.floor(diff / 60000)}m ago`
    } else if (diff < 86400000) {
      return `${Math.floor(diff / 3600000)}h ago`
    } else {
      return `${Math.floor(diff / 86400000)}d ago`
    }
  }

  return (
    <div ref={dropdownRef} className="absolute right-0 top-full mt-2 w-80 rounded-md border bg-background shadow-lg">
      <div className="flex items-center justify-between border-b p-3">
        <h3 className="font-medium">Notifications</h3>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => markAllAsRead()}
          disabled={unreadCount === 0}
        >
          Mark all as read
        </Button>
      </div>

      <ScrollArea className="h-80">
        {notifications.length === 0 ? (
          <div className="flex h-full items-center justify-center p-4 text-center text-sm text-muted-foreground">
            No notifications
          </div>
        ) : (
          <div className="divide-y">
            {notifications.map((notification) => {
              const isRead = notification.readBy && user && notification.readBy.map(id => id.toString()).includes(user.id.toString());
              return (
                <div
                  key={notification.id}
                  className={`flex cursor-pointer gap-3 p-3 hover:bg-muted/50 ${
                    isRead ? "opacity-70" : "bg-muted/20"
                  }`}
                  onClick={() => markAsRead(notification.id)}
                >
                  <div className="mt-0.5 flex-shrink-0">{getNotificationIcon(notification.type)}</div>
                  <div className="flex-1">
                    <p className="text-sm">{notification.message}</p>
                    <p className="text-xs text-muted-foreground">
                      {notification.createdBy && (
                        <span className="font-semibold mr-1">{notification.createdBy}</span>
                      )}
                      {formatTime(notification.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </ScrollArea>
    </div>
  )
}
