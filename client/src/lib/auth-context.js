"use client"

import { createContext, useContext, useEffect, useState } from "react"
import api from "./api"

const AuthContext = createContext(undefined)

// Mock departments data - will be replaced with API call
export const departments = [
  { id: "dept-1", name: "Engineering" },
  { id: "dept-2", name: "Marketing" },
  { id: "dept-3", name: "Finance" },
  { id: "dept-4", name: "Human Resources" },
  { id: "dept-5", name: "Operations" },
]

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for saved token in localStorage
    const loadUser = async () => {
      const token = localStorage.getItem("taskyToken")

      if (!token) {
        setLoading(false)
        return
      }

      try {
        const res = await api.get("/auth/me")
        setUser(res.data)
      } catch (error) {
        localStorage.removeItem("taskyToken")
      } finally {
        setLoading(false)
      }
    }

    loadUser()
  }, [])

  const login = async (email, password) => {
    setLoading(true)
    try {
      const res = await api.post("/auth/login", { email, password })

      const { token, user } = res.data

      localStorage.setItem("taskyToken", token)
      setUser(user)
    } catch (error) {
      throw new Error(error.response?.data?.message || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  const register = async (userData) => {
    setLoading(true)
    try {
      // Find department name from ID
      const department = departments.find((d) => d.id === userData.departmentId)
      if (!department) {
        throw new Error("Invalid department")
      }

      const res = await api.post("/auth/register", {
        ...userData,
        departmentName: department.name,
      })

      // If user is auto-approved (admin), login automatically
      if (res.data.token && res.data.user) {
        localStorage.setItem("taskyToken", res.data.token)
        setUser(res.data.user)
      }
    } catch (error) {
      throw new Error(error.response?.data?.message || "Registration failed")
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    localStorage.removeItem("taskyToken")
    setUser(null)
  }

  return <AuthContext.Provider value={{ user, loading, login, register, logout }}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
