"use client"

import { useState, useEffect } from "react"
import { Outlet } from "react-router-dom"
import { useAuth } from "../lib/auth-context"
import { Loader2 } from "lucide-react"
import DashboardHeader from "../components/dashboard-header"
import DashboardSidebar from "../components/dashboard-sidebar"
import TaskExpirationAlert from "../components/task-expiration-alert"

export default function DashboardLayout() {
  const { user, loading } = useAuth()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col">
      <DashboardHeader />
      <div className="flex flex-1">
        <DashboardSidebar />
        <main className="flex-1 overflow-y-auto p-6">
          <TaskExpirationAlert />
          <Outlet />
        </main>
      </div>
    </div>
  )
}
