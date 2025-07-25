import { useEffect, useState } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "../components/ui/card"
import { useToast } from "../hooks/use-toast"
import { useAuth } from "../lib/auth-context"
import { useNotifications } from "../lib/notification-context"
import { CheckCircle2, UserX, XCircle } from "lucide-react"
import { useNavigate } from "react-router-dom"
import api from "../lib/api"

export default function UsersPage() {
  const { user } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const { addNotification } = useNotifications()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [debug, setDebug] = useState(false)

  // If user is null/undefined after a short delay, show a message
  useEffect(() => {
    if (user === null || user === undefined) {
      const timer = setTimeout(() => {
        setError("You are not logged in.");
        setLoading(false);
      }, 1500); // 1.5 seconds waiting for user context
      return () => clearTimeout(timer);
    }
  }, [user]);

  useEffect(() => {
    // Redirect if not admin
    if (user && user.role !== "admin") {
      setError("You must be an admin to view this page.");
      setLoading(false);
      return;
    }

    // Fetch users in the same department
    const fetchUsers = async () => {
      if (!user) {
        setError("You must be logged in to view this page.");
        setLoading(false);
        return;
      }
      try {
        // setLoading(true);
        setError(null);
        const res = await api.get("/users/department");
        // console.log(res.data)
        // Format users
        const formattedUsers = res.data.map((u) => ({
          ...u,
          id: u._id,
        }));
        setUsers(formattedUsers);
      } catch (err) {
        console.error("Error fetching users:", err);
        setError(err?.response?.data?.message || err?.message || "Failed to load users");
        toast({
          title: "Error",
          description: err?.response?.data?.message || err?.message || "Failed to load users",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    fetchUsers();
  }, [user, navigate, toast]);

  const handleApproveUser = async (userId) => {
    try {
      await api.put(`/users/${userId}/approve`)

      // Update local state
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, approved: true } : u)))

      const approvedUser = users.find((u) => u.id === userId)

      if (user && approvedUser) {
        await addNotification({
          type: "success",
          message: `User ${approvedUser.name} has been approved`,
        })

        toast({
          title: "User approved",
          description: `${approvedUser.name} can now access the system`,
        })
      }
    } catch (error) {
      console.error("Error approving user:", error)
      toast({
        title: "Error",
        description: "Failed to approve user",
        variant: "destructive",
      })
    }
  }

  const handleRejectUser = async (userId) => {
    try {
      await api.delete(`/users/${userId}`)

      const rejectedUser = users.find((u) => u.id === userId)

      // Update local state
      setUsers((prev) => prev.filter((u) => u.id !== userId))

      if (user && rejectedUser) {
        await addNotification({
          type: "info",
          message: `User ${rejectedUser.name} has been rejected`,
        })

        toast({
          title: "User rejected",
          description: `${rejectedUser.name} has been removed from the system`,
        })
      }
    } catch (error) {
      console.error("Error rejecting user:", error)
      toast({
        title: "Error",
        description: "Failed to reject user",
        variant: "destructive",
      })
    }
  }

  // Filter users to only show those in the admin's department
  const departmentUsers = users

  // Get pending approval users in admin's department
  const pendingUsers = departmentUsers.filter((u) => !u.approved)

  // Get approved users in admin's department
  const approvedUsers = departmentUsers.filter((u) => u.approved)

  // Debug panel
  // const debugPanel = debug && (
  //   <div className="p-4 bg-gray-100 border rounded mb-4 text-xs">
  //     <strong>DEBUG:</strong>
  //     <pre>User: {JSON.stringify(user, null, 2)}</pre>
  //     <pre>Error: {JSON.stringify(error, null, 2)}</pre>
  //     <button className="underline text-blue-600" onClick={() => setDebug(false)}>Hide debug</button>
  //   </div>
  // );

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="mb-2">You are not logged in.</p>
        <button className="underline text-blue-600" onClick={() => setDebug((d) => !d)}>Show debug</button>
        {/* {debugPanel} */}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full">
        <p className="mb-2 text-red-600">{error}</p>
        <button className="underline text-blue-600" onClick={() => setDebug((d) => !d)}>Show debug</button>
        {/* {debugPanel} */}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <p>Loading users...</p>
        {/* <button className="ml-2 underline text-blue-600" onClick={() => setDebug((d) => !d)}>Show debug</button> */}
        {/* {debugPanel} */}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* <button className="underline text-blue-600 text-xs mb-2" onClick={() => setDebug((d) => !d)}>
        {debug ? "Hide debug" : "Show debug"}
      </button> */}
      {/* {debugPanel} */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Users</h1>
        <p className="text-muted-foreground">Manage users in the {user.department.name} department</p>
      </div>

      {pendingUsers.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle>Pending Approval</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingUsers.map((pendingUser) => (
                <div key={pendingUser.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <h3 className="font-medium">{pendingUser.name}</h3>
                    <p className="text-sm text-muted-foreground">{pendingUser.email}</p>
                    <p className="text-xs text-muted-foreground">Department: {pendingUser.department.name}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-green-500 hover:text-green-600"
                      onClick={() => handleApproveUser(pendingUser.id)}
                    >
                      <CheckCircle2 className="mr-2 h-4 w-4" />
                      Approve
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleRejectUser(pendingUser.id)}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Department Users</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {approvedUsers.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground">No approved users found in your department</p>
            ) : (
              approvedUsers.map((approvedUser) => (
                <div key={approvedUser.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-medium">{approvedUser.name}</h3>
                      {approvedUser.role === "admin" && (
                        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                          Admin
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground">{approvedUser.email}</p>
                    <p className="text-xs text-muted-foreground">Department: {approvedUser.department.name}</p>
                  </div>
                  {approvedUser.id !== user?.id && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-red-500 hover:text-red-600"
                      onClick={() => handleRejectUser(approvedUser.id)}
                    >
                      <UserX className="mr-2 h-4 w-4" />
                      Remove
                    </Button>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
