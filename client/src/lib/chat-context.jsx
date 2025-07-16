"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { useAuth } from "./auth-context"
import api from "./api"

const ChatContext = createContext(undefined)

export function ChatProvider({ children }) {
  const [messages, setMessages] = useState([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  const fetchMessages = async () => {
    if (!user) {
      setMessages([])
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      const res = await api.get("/chat/department")

      const formattedMessages = res.data.map((message) => ({
        ...message,
        id: message._id,
        timestamp: new Date(message.timestamp),
      }))

      setMessages(formattedMessages)
    } catch (error) {
      console.error("Error fetching messages:", error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMessages()

    const interval = setInterval(fetchMessages, 10000)

    return () => clearInterval(interval)
  }, [user])

  const sendMessage = async (content) => {
    if (!user || !content.trim()) return

    try {
      const res = await api.post("/chat", { content })

      const newMessage = {
        ...res.data,
        id: res.data._id,
        timestamp: new Date(res.data.timestamp),
      }

      setMessages((prev) => [...prev, newMessage])
      return newMessage
    } catch (error) {
      console.error("Error sending message:", error)
      throw error
    }
  }

  return (
    <ChatContext.Provider value={{ messages, loading, sendMessage, fetchMessages }}>{children}</ChatContext.Provider>
  )
}

export function useChat() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error("useChat must be used within a ChatProvider")
  }
  return context
}
