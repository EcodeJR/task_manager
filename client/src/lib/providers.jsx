import { AuthProvider } from "./auth-context"
import { ChatProvider } from "./chat-context"
import { NotificationProvider } from "./notification-context"
import { SidebarProvider } from "./sidebar-context"
import { TaskProvider } from "./task-context"

export function Providers({ children }) {
  return (
    <AuthProvider>
      <NotificationProvider>
        <TaskProvider>
          <ChatProvider>
            <SidebarProvider>{children}</SidebarProvider>
          </ChatProvider>
        </TaskProvider>
      </NotificationProvider>
    </AuthProvider>
  )
}
