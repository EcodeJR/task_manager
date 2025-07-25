"use client"

import { useState } from "react"
import { Button } from "./ui/button"
import { useAuth } from "../lib/auth-context"
import { useSidebar } from "../lib/sidebar-context"
import { Bell, LogOut, Menu } from "lucide-react"
import NotificationDropdown from "./notification-dropdown"
import { useNavigate } from "react-router-dom"
import EnablePushPopup from "./EnablePushButton";
import { useNotifications } from "../lib/notification-context";

export default function DashboardHeader() {
  const { user, logout } = useAuth()
  const { toggleSidebar } = useSidebar()
  const navigate = useNavigate()
  const [notificationsOpen, setNotificationsOpen] = useState(false)
  const { getDepartmentUnreadCount } = useNotifications();
  const unreadCount = getDepartmentUnreadCount();

  // Button toggle logic: always toggles open/close
  const handleNotificationClick = () => {
    setNotificationsOpen((open) => !open);
  };

  const handleLogout = () => {
    logout()
    navigate("/auth")
  }

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b bg-background px-4 md:px-6">
      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
          <Menu className="h-5 w-5" />
        </Button>
        <h1 className="text-xl font-bold">Tasky</h1>
      </div>
      <div className="flex items-center gap-4">
        <div className="relative">
          <Button variant="ghost" size="icon" onClick={handleNotificationClick}>
            <Bell className="h-5 w-5" />
            {unreadCount > 0 && (
              <div className="absolute top-0 right-0 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
            )}
          </Button>
          {notificationsOpen && <NotificationDropdown onClose={() => setNotificationsOpen(false)} />}
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden text-sm font-medium md:inline-block">{user?.name}</span>
          <Button variant="ghost" size="icon" onClick={handleLogout}>
            <LogOut className="h-5 w-5" />
          </Button>
        </div>
      </div>
      <EnablePushPopup />
    </header>
  )
}
