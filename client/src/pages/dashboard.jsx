"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "../components/ui/card"
import { useAuth } from "../lib/auth-context"
import { useNotifications } from "../lib/notification-context"
import { useTasks } from "../lib/task-context"
import { CheckCircle2, Clock, ListTodo } from "lucide-react"

export default function DashboardPage() {
  const { user } = useAuth()
  const { tasks, getTasksByDepartment } = useTasks()
  const { getUnreadCount } = useNotifications()

  const departmentTasks = user ? getTasksByDepartment(user.department.id) : []
  const completedTasks = departmentTasks.filter((task) => task.completed)
  const pendingTasks = departmentTasks.filter((task) => !task.completed)
  const unreadNotifications = user ? getUnreadCount(user.id) : 0

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user?.name}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <ListTodo className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{departmentTasks.length}</div>
            <p className="text-xs text-muted-foreground">In your department</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed Tasks</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {completedTasks.length > 0
                ? `${Math.round((completedTasks.length / departmentTasks.length) * 100)}% completion rate`
                : "No tasks completed yet"}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Tasks</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pendingTasks.length}</div>
            <p className="text-xs text-muted-foreground">
              {pendingTasks.length > 0 ? "Require attention" : "All tasks completed"}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Recent Tasks</CardTitle>
            <CardDescription>Latest tasks in your department</CardDescription>
          </CardHeader>
          <CardContent>
            {departmentTasks.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">No tasks found in your department</p>
            ) : (
              <div className="space-y-4">
                {departmentTasks
                  .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
                  .slice(0, 5)
                  .map((task) => (
                    <div key={task.id} className="flex items-center gap-4">
                      <div
                        className={`h-2 w-2 rounded-full ${
                          task.completed
                            ? "bg-green-500"
                            : task.urgency === "critical"
                              ? "bg-red-500"
                              : task.urgency === "high"
                                ? "bg-amber-500"
                                : task.urgency === "medium"
                                  ? "bg-blue-500"
                                  : "bg-slate-500"
                        }`}
                      />
                      <div className="flex-1 space-y-1">
                        <p className="text-sm font-medium leading-none">{task.title}</p>
                        <p className="text-xs text-muted-foreground">Added by {task.addedBy.name}</p>
                      </div>
                      <div className="text-xs text-muted-foreground">{task.completed ? "Completed" : "Pending"}</div>
                    </div>
                  ))}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="col-span-1">
          <CardHeader>
            <CardTitle>Department Overview</CardTitle>
            <CardDescription>Summary of your department's activity</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium">Department</p>
                  <p className="text-xl font-bold">{user?.department.name}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium">Role</p>
                  <p className="text-xl font-bold capitalize">{user?.role}</p>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span>Task Completion</span>
                  <span>
                    {departmentTasks.length > 0
                      ? `${Math.round((completedTasks.length / departmentTasks.length) * 100)}%`
                      : "0%"}
                  </span>
                </div>
                <div className="h-2 rounded-full bg-muted">
                  <div
                    className="h-full rounded-full bg-primary"
                    style={{
                      width:
                        departmentTasks.length > 0
                          ? `${Math.round((completedTasks.length / departmentTasks.length) * 100)}%`
                          : "0%",
                    }}
                  />
                </div>
              </div>

              <div className="pt-4">
                <p className="text-sm font-medium">Quick Stats</p>
                <ul className="mt-2 space-y-2 text-sm">
                  <li className="flex justify-between">
                    <span>Critical Tasks</span>
                    <span>{departmentTasks.filter((t) => t.urgency === "critical" && !t.completed).length}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>High Priority Tasks</span>
                    <span>{departmentTasks.filter((t) => t.urgency === "high" && !t.completed).length}</span>
                  </li>
                  <li className="flex justify-between">
                    <span>Unread Notifications</span>
                    <span>{unreadNotifications}</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
    
  )
}
