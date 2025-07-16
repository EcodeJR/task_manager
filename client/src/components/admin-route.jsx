"use client"

import { Navigate } from "react-router-dom"
import { useAuth } from "../lib/auth-context"

export default function AdminRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user || user.role !== "admin") {
    return <Navigate to="/dashboard" replace />
  }

  return <>{children}</>
}
