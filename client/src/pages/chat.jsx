"use client"

import { useRef, useEffect, useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { ScrollArea } from "../components/ui/scroll-area"
import { useAuth } from "../lib/auth-context"
import { useChat } from "../lib/chat-context"
import { Send, Loader2 } from "lucide-react"

export default function ChatPage() {
  const { user } = useAuth()
  const { messages, sendMessage, loading } = useChat()
  const [messageText, setMessageText] = useState("")
  const [sending, setSending] = useState(false)
  const scrollAreaRef = useRef(null)

  useEffect(() => {
    if (scrollAreaRef.current) {
      scrollAreaRef.current.scrollTop = scrollAreaRef.current.scrollHeight
    }
  }, [messages])

  const handleSendMessage = async (e) => {
    e.preventDefault()

    if (!user || !messageText.trim() || sending) return

    try {
      setSending(true)
      await sendMessage(messageText)
      setMessageText("")
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setSending(false)
    }
  }

  return (
    <div className="flex h-[calc(100vh-10rem)] flex-col space-y-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Chat</h1>
        <p className="text-muted-foreground">Communicate with your team members</p>
      </div>

      <Card className="flex flex-1 flex-col">
        <CardHeader className="border-b px-6 py-4">
          <CardTitle>Department Chat</CardTitle>
        </CardHeader>
        <CardContent className="flex flex-1 flex-col p-0">
          {loading ? (
            <div className="flex items-center justify-center h-full">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <ScrollArea ref={scrollAreaRef} className="flex-1 p-6">
              {messages.map((message) => {
                const isCurrentUser = message.sender.id === user?.id

                return (
                  <div key={message.id} className={`flex mb-4 ${isCurrentUser ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-[80%] rounded-lg px-4 py-2 ${
                        isCurrentUser ? "bg-primary text-primary-foreground" : "bg-muted"
                      }`}
                    >
                      <div className="mb-1 flex items-center gap-2">
                        <span
                          className={`text-xs font-medium ${
                            isCurrentUser ? "text-primary-foreground" : "text-foreground"
                          }`}
                        >
                          {message.sender.name}
                        </span>
                      </div>
                      <p
                        className={`whitespace-pre-wrap text-sm ${
                          isCurrentUser ? "text-primary-foreground" : "text-foreground"
                        }`}
                      >
                        {message.content}
                      </p>
                    </div>
                  </div>
                )
              })}
            </ScrollArea>
          )}

          <div className="border-t p-4">
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <Input
                placeholder="Type your message..."
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                className="flex-1"
                disabled={sending}
              />
              <Button type="submit" size="icon" disabled={!messageText.trim() || sending}>
                {sending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
              </Button>
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
