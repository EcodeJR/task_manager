"use client"

import { useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent } from "../components/ui/card"
import { Checkbox } from "../components/ui/checkbox"
import { useToast } from "../hooks/use-toast"
import { useAuth } from "../lib/auth-context"
import { useNotifications } from "../lib/notification-context"
import { useTasks } from "../lib/task-context"
import { Plus, Trash2 } from "lucide-react"

import { Dialog, DialogHeader, DialogTitle, DialogContent } from "../components/ui/dialog";

export default function TasksPage() {
  const { user } = useAuth()
  const { tasks, addTask, updateTask, deleteTask, getTasksByDepartment } = useTasks()
  const { addNotification } = useNotifications()
  const { toast } = useToast()
  const [isDialogOpen, setIsDialogOpen] = useState(false)

  const departmentTasks = user ? getTasksByDepartment(user.department.id) : []

  const handleTaskCompletion = (taskId, completed) => {
    updateTask(taskId, { completed })

    if (user) {
      addNotification({
        type: completed ? "success" : "info",
        message: completed ? `Task marked as completed` : `Task marked as incomplete`,
        userId: user.id,
      })

      toast({
        title: completed ? "Task completed" : "Task reopened",
        description: completed ? "The task has been marked as completed" : "The task has been reopened",
      })
    }
  };

  const handleDeleteTask = (taskId) => {
    if (!user || user.role !== "admin") return

    const task = tasks.find((t) => t.id === taskId)
    if (!task) return

    deleteTask(taskId)

    addNotification({
      type: "info",
      message: `Task "${task.title}" has been deleted`,
      userId: user.id,
    })

    toast({
      title: "Task deleted",
      description: "The task has been permanently deleted",
    })
  };

  const getUrgencyColor = (urgency) => {
    switch (urgency) {
      case "low":
        return "bg-slate-500"
      case "medium":
        return "bg-blue-500"
      case "high":
        return "bg-amber-500"
      case "critical":
        return "bg-red-500"
      default:
        return "bg-slate-500"
    }
  };
  

  return (
    <>
      <>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Tasks</h1>
              <p className="text-muted-foreground">Manage and track tasks in your department</p>
              
            </div>
              <Button onClick={() => setIsDialogOpen(true)}>
                <Plus className="mr-2 h-4 w-4" />
                Add Task
              </Button>
          </div>

          <div className="space-y-4">
            {departmentTasks.length === 0 ? (
              <Card>
                <CardContent className="flex flex-col items-center justify-center p-6">
                  <p className="mb-2 text-center text-lg font-medium">No tasks found</p>
                  <p className="text-center text-sm text-muted-foreground">Get started by creating your first task</p>
                  <Button className="mt-4" onClick={() => setIsDialogOpen(true)}>
                    <Plus className="mr-2 h-4 w-4" />
                    Add Task
                  </Button>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {departmentTasks
                  .sort((a, b) => {
                    if (a.completed !== b.completed) {
                      return a.completed ? 1 : -1
                    }
                    if (!a.completed) {
                      const urgencyOrder = { critical: 0, high: 1, medium: 2, low: 3 }
                      return urgencyOrder[a.urgency] - urgencyOrder[b.urgency]
                    }
                    return b.createdAt.getTime() - a.createdAt.getTime()
                  })
                  .map((task) => (
                    <Card key={task.id} className={task.completed ? "opacity-70" : ""}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            checked={task.completed}
                            onCheckedChange={(checked) => handleTaskCompletion(task.id, checked)}
                            className="mt-1"
                          />
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center justify-between">
                              <h3 className={`font-medium ${task.completed ? "line-through text-muted-foreground" : ""}`}>
                                {task.title}
                              </h3>
                              <div className="flex items-center gap-2">
                                <div className={`h-2 w-2 rounded-full ${getUrgencyColor(task.urgency)}`} />
                                {user?.role === "admin" && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6 text-muted-foreground hover:text-destructive"
                                    onClick={() => handleDeleteTask(task.id)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                )}
                              </div>
                            </div>
                            <p className="text-sm text-muted-foreground">{task.description}</p>
                            <div className="flex flex-wrap items-center justify-between gap-2 pt-2 text-xs">
                              <span className="text-muted-foreground">Added by {task.addedBy.name}</span>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
              </div>
            )}
          </div>
        </div>

        {/* Add Task Dialog */}
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogHeader>
            <DialogTitle>Add Task</DialogTitle>
          </DialogHeader>
          <DialogContent>
            <form
              className="space-y-4"
              onSubmit={async (e) => {
                e.preventDefault();
                const form = e.target;
                const title = form.title.value.trim();
                const description = form.description.value.trim();
                const urgency = form.urgency.value;
                const dueDate = form.dueDate.value;
                // Validation
                if (!title || !description || !dueDate) {
                  toast({ title: "Missing fields", description: "Please fill in all required fields." });
                  return;
                }
                try {
                  await addTask({
                    title,
                    description,
                    department: user.department.id,
                    urgency,
                    dueDate,
                  });
                  toast({ title: "Task added", description: "The new task has been created." });
                  setIsDialogOpen(false);
                  form.reset();
                } catch (err) {
                  toast({ title: "Error", description: err?.message || "Failed to add task." });
                }
              }}
            >
              <div>
                <label className="block text-left font-medium mb-1" htmlFor="title">Title<span className="text-red-500">*</span></label>
                <input
                  id="title"
                  name="title"
                  type="text"
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-left font-medium mb-1" htmlFor="description">Description<span className="text-red-500">*</span></label>
                <textarea
                  id="description"
                  name="description"
                  rows={3}
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div>
                <label className="block text-left font-medium mb-1" htmlFor="department">Department</label>
                <input
                  id="department"
                  name="department"
                  type="text"
                  className="w-full border rounded px-3 py-2 bg-gray-100"
                  value={user?.department?.name || ""}
                  disabled
                  readOnly
                />
              </div>
              <div>
                <label className="block text-left font-medium mb-1" htmlFor="urgency">Urgency</label>
                <select
                  id="urgency"
                  name="urgency"
                  className="w-full border rounded px-3 py-2"
                  defaultValue="medium"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block text-left font-medium mb-1" htmlFor="dueDate">Due Date<span className="text-red-500">*</span></label>
                <input
                  id="dueDate"
                  name="dueDate"
                  type="date"
                  className="w-full border rounded px-3 py-2"
                  required
                />
              </div>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                <Button type="submit">Add Task</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </>
    </>
  
  );
}
