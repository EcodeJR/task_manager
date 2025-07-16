"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./auth-context"
import api from "./api"

const TaskContext = createContext(undefined)

export function TaskProvider({ children }) {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchTasks = async () => {
    if (!user) {
      setTasks([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const res = await api.get(`/tasks/department/${user.department.id}`)

      const formattedTasks = res.data.map((task) => ({
        ...task,
        id: task._id,
        dueDate: new Date(task.dueDate),
        createdAt: new Date(task.createdAt),
      }))

      setTasks(formattedTasks)
    } catch (error) {
      console.error("Error fetching tasks:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTasks()
  }, [user])

  const addTask = async (task) => {
    if (!user) return

    try {
      const res = await api.post("/tasks", task)

      const newTask = {
        ...res.data,
        id: res.data._id,
        dueDate: new Date(res.data.dueDate),
        createdAt: new Date(res.data.createdAt),
      }

      setTasks((prev) => [...prev, newTask])
      return newTask
    } catch (error) {
      console.error("Error adding task:", error)
      throw error
    }
  }

  const updateTask = async (id, updates) => {
    try {
      const res = await api.put(`/tasks/${id}`, updates)

      const updatedTask = {
        ...res.data,
        id: res.data._id,
        dueDate: new Date(res.data.dueDate),
        createdAt: new Date(res.data.createdAt),
      }

      setTasks((prev) => prev.map((task) => (task.id === id ? updatedTask : task)))
      return updatedTask
    } catch (error) {
      console.error("Error updating task:", error)
      throw error
    }
  }

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}`)
      setTasks((prev) => prev.filter((task) => task.id !== id))
    } catch (error) {
      console.error("Error deleting task:", error)
      throw error
    }
  }

  const getTasksByDepartment = (departmentId) => {
    return tasks.filter((task) => task.department === departmentId)
  }

  const getExpiringSoonTasks = () => {
    const now = new Date()
    const fourHoursFromNow = new Date(now.getTime() + 4 * 60 * 60 * 1000)

    return tasks.filter((task) => !task.completed && task.dueDate > now && task.dueDate < fourHoursFromNow)
  }

  return (
    <TaskContext.Provider
      value={{
        tasks,
        loading,
        addTask,
        updateTask,
        deleteTask,
        getTasksByDepartment,
        getExpiringSoonTasks,
        fetchTasks,
      }}
    >
      {children}
    </TaskContext.Provider>
  )
}

export function useTasks() {
  const context = useContext(TaskContext)
  if (context === undefined) {
    throw new Error("useTasks must be used within a TaskProvider")
  }
  return context
}
