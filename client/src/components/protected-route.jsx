"use client"

import { Navigate } from "react-router-dom"
import { useAuth } from "../lib/auth-context"

export default function ProtectedRoute({ children }) {
  const { user, loading } = useAuth()

  if (loading) {
    return( 
    <section className="w-full h-screen flex items-center justify-center flex-col">
      <div className="bg-transparent border-t-2 border-l-2 border-b-2 border-r-0 border-blue-800 animate-spin ease-in-out rounded-full w-12 h-12"></div>
      <div>Please wait a minute or 2......</div>
    </section>
     )
  }

  if (!user) {
    return <Navigate to="/auth" replace />
  }

  return <>{children}</>
}
