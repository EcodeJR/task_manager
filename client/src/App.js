import { Routes, Route, Navigate } from "react-router-dom"
import { ThemeProvider } from "./components/theme-provider"
import { Toaster } from "./components/ui/toaster"
import AuthPage from "./pages/auth"
import DashboardLayout from "./layouts/dashboard-layout"
import DashboardPage from "./pages/dashboard"
import TasksPage from "./pages/tasks"
import ChatPage from "./pages/chat"
import UsersPage from "./pages/users"
import ProtectedRoute from "./components/protected-route"
import AdminRoute from "./components/admin-route"

function App() {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <Routes>
        <Route path="/" element={<Navigate to="/auth" replace />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }
        >
          <Route index element={<DashboardPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="chat" element={<ChatPage />} />
          <Route
            path="users"
            element={
              <AdminRoute>
                <UsersPage />
              </AdminRoute>
            }
          />
        </Route>
      </Routes>
      <Toaster />
    </ThemeProvider>
  )
}

export default App
