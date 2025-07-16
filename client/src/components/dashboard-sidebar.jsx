"use client"

import { Button } from "./ui/button"
import { useAuth } from "../lib/auth-context"
import { useSidebar } from "../lib/sidebar-context"
import { CheckSquare, MessageSquare, Users, LayoutDashboard, X } from "lucide-react"
import { Link, useLocation } from "react-router-dom"
import { cn } from "../lib/utils"

export default function DashboardSidebar() {
  const { user } = useAuth()
  const { sidebarOpen, setSidebarOpen } = useSidebar()
  const location = useLocation()

  const isActive = (path) => {
    return location.pathname === path
  }

  const navItems = [
    {
      name: "Dashboard",
      href: "/dashboard",
      icon: <LayoutDashboard className="h-5 w-5" />,
    },
    {
      name: "Tasks",
      href: "/dashboard/tasks",
      icon: <CheckSquare className="h-5 w-5" />,
    },
    {
      name: "Chat",
      href: "/dashboard/chat",
      icon: <MessageSquare className="h-5 w-5" />,
    },
  ]

  // Only show the Users page for admins
  if (user?.role === "admin") {
    navItems.push({
      name: "Users",
      href: "/dashboard/users",
      icon: <Users className="h-5 w-5" />,
    })
  }

  return (
    <>
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 transform border-r bg-background transition-transform duration-200 ease-in-out md:static md:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } shadow-lg md:shadow-none`}
      >
        {/* Mobile header */}
        <div className="flex h-16 items-center justify-between border-b px-4 md:hidden">
          <h2 className="text-lg font-bold tracking-tight">Tasky</h2>
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(false)}>
            <X className="h-5 w-5" />
          </Button>
        </div>
        <div className="flex h-[calc(100%-4rem)] flex-col md:h-full">
          <div className="flex-1 overflow-y-auto py-6">
            <nav className="flex flex-col gap-1 px-2">
              {navItems.map((item) => (
                <Link key={item.href} to={item.href} onClick={() => setSidebarOpen(false)}>
                  <div
                    className={cn(
                      "flex items-center gap-3 rounded-md px-3 py-2 transition-colors cursor-pointer group",
                      isActive(item.href)
                        ? "bg-secondary text-foreground font-semibold shadow-sm"
                        : "hover:bg-accent hover:text-accent-foreground text-muted-foreground"
                    )}
                  >
                    <span className={cn(
                      "transition-colors",
                      isActive(item.href) ? "text-primary" : "group-hover:text-accent-foreground text-muted-foreground"
                    )}>{item.icon}</span>
                    <span className="ml-1 text-base tracking-tight">{item.name}</span>
                  </div>
                </Link>
              ))}
            </nav>
          </div>
          <div className="border-t p-4 bg-muted/50">
            <div className="flex flex-col gap-1">
              <p className="text-sm font-bold text-foreground truncate">{user?.name}</p>
              <p className="text-xs text-muted-foreground">
                {user?.role ? user.role.charAt(0).toUpperCase() + user.role.slice(1) : ""}
                {user?.department?.name ? ` • ${user.department.name}` : ""}
              </p>
            </div>
          </div>
        </div>
      </aside>
    </>
  )
}
