"use client"

import { Navigate } from "react-router-dom"
import { useAuth } from "../lib/auth-context"

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return <div>Loading...</div>
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}
