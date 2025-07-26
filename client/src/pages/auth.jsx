"use client"

import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { useToast } from "../hooks/toast-context"
import { departments, useAuth } from "../lib/auth-context"
import { Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function AuthPage() {
  const { user, loading, login, register, adminRegister } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState("login")

  // Login form state
  const [loginEmail, setLoginEmail] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [isLoggingIn, setIsLoggingIn] = useState(false)

  // Register form state
  const [registerName, setRegisterName] = useState("")
  const [registerEmail, setRegisterEmail] = useState("")
  const [registerPassword, setRegisterPassword] = useState("")
  const [registerRole, setRegisterRole] = useState("staff")
  const [registerDepartment, setRegisterDepartment] = useState("")
  const [adminCode, setAdminCode] = useState("")
  const [isRegistering, setIsRegistering] = useState(false)

  useEffect(() => {
    if (user) {
      navigate("/dashboard")
    }
  }, [user, navigate])

  const handleLogin = async (e) => {
    e.preventDefault()
    if (!loginEmail || !loginPassword) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setIsLoggingIn(true)
    try {
      await login(loginEmail, loginPassword)
      toast({
        title: "Success",
        description: "You have been logged in",
      })
    } catch (error) {
      // Robust error logging for debugging
      // console.log("LOGIN ERROR OBJECT:", error);
      let msg = "Failed to login";
      if (error && error.response && error.response.data && error.response.data.message) {
        msg = error.response.data.message;
      } else if (error.message) {
        msg = error.message;
      } else {
        msg = JSON.stringify(error);
      }
      // Always show a toast for any error
      toast({
        title: "Error",
        description: msg,
        variant: "destructive",
      });
      // Uncomment below for more specific error toasts after debugging
      /*
      if (
        msg.toLowerCase().includes("pending approval") ||
        msg.toLowerCase().includes("not approved")
      ) {
        toast({
          title: "Not Approved",
          description: "Your account has not been approved by an admin yet. Please wait for approval before logging in.",
          variant: "destructive",
        });
      } else if (
        msg.toLowerCase().includes("invalid credentials") ||
        msg.toLowerCase().includes("incorrect password")
      ) {
        toast({
          title: "Invalid Credentials",
          description: "The email or password you entered is incorrect.",
          variant: "destructive",
        });
      } else if (msg.toLowerCase().includes("network error")) {
        toast({
          title: "Network Error",
          description: "Could not connect to the server. Please check your internet connection and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: msg,
          variant: "destructive",
        });
      }
      */
    } finally {
      setIsLoggingIn(false)
    }
  }

  const handleRegister = async (e) => {
    e.preventDefault()
    if (!registerName || !registerEmail || !registerPassword || !registerDepartment) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      })
      return
    }

    setIsRegistering(true);
    try {
      if (registerRole === "admin") {
        console.log("Attempting admin registration", {
          name: registerName,
          email: registerEmail,
          password: registerPassword,
          departmentId: registerDepartment,
          inviteCode: adminCode,
        });
        await adminRegister({
          name: registerName,
          email: registerEmail,
          password: registerPassword,
          departmentId: registerDepartment,
          inviteCode: adminCode,
        });
        toast({
          title: "Success",
          description: "Your admin account has been created",
        });
        navigate("/dashboard");
        return;
      } else {
        await register({
          name: registerName,
          email: registerEmail,
          password: registerPassword,
          role: registerRole,
          departmentId: registerDepartment,
        });
      }

      toast({
        title: "Success",
        description:
          registerRole === "admin"
            ? "Your admin account has been created"
            : "Your account has been created",
      });
      navigate("/dashboard");
    } catch (error) {
      let msg = "Registration failed";
      if (error && error.response && error.response.data && error.response.data.message) {
        msg = error.response.data.message;
      } else if (error instanceof Error && error.message) {
        msg = error.message;
      }
      if (
        msg.toLowerCase().includes("already registered") ||
        msg.toLowerCase().includes("user exists")
      ) {
        toast({
          title: "Already Registered",
          description: "An account with this email already exists. Please log in or use a different email.",
          variant: "destructive",
        });
      } else if (
        msg.toLowerCase().includes("pending approval") ||
        msg.toLowerCase().includes("not approved")
      ) {
        toast({
          title: "Pending Approval",
          description: "Your account is pending admin approval. Please wait until an admin approves your registration.",
          variant: "destructive",
        });
      } else if (
        msg.toLowerCase().includes("invalid invite code") ||
        msg.toLowerCase().includes("invalid admin code")
      ) {
        toast({
          title: "Invalid Admin Code",
          description: "The admin invite code you entered is invalid. Please check and try again.",
          variant: "destructive",
        });
      } else if (msg.toLowerCase().includes("network error")) {
        toast({
          title: "Network Error",
          description: "Could not connect to the server. Please check your internet connection and try again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: msg,
          variant: "destructive",
        });
      }
    } finally {
      setIsRegistering(false);
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-muted/40 p-4">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold">Tasky</h1>
        <p className="text-muted-foreground">Task Handover Tracking System</p>
      </div>

      <Card className="w-full max-w-md">
        <Tabs defaultValue="login" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="login"
              className={`bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-b-2 ${activeTab === "login" ? "border-primary bg-primary/10 dark:bg-slate-700 font-semibold" : "border-transparent"}`}
            >
              Login
            </TabsTrigger>
            <TabsTrigger
              value="register"
              className={`bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors border-b-2 ${activeTab === "register" ? "border-primary bg-primary/10 dark:bg-slate-700 font-semibold" : "border-transparent"}`}
            >
              Register
            </TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Login</CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">Sign in to your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-slate-900 dark:text-white">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-slate-900 dark:text-white">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full bg-primary hover:bg-primary/90 focus:ring-2 focus:ring-primary dark:bg-blue-800 dark:text-white dark:hover:bg-blue-700 dark:focus:ring-2 dark:focus:ring-blue-600 transition-colors" disabled={isLoggingIn}>
                  {isLoggingIn ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Logging in...
                    </>
                  ) : (
                    "Login"
                  )}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>

          <TabsContent value="register">
            <form onSubmit={handleRegister}>
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-slate-900 dark:text-white">Register</CardTitle>
                <CardDescription className="text-slate-500 dark:text-slate-400">Create a new account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="text-slate-900 dark:text-white">Full Name</Label>
                  <Input
                    id="name"
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email" className="text-slate-900 dark:text-white">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password" className="text-slate-900 dark:text-white">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-900 dark:text-white">Role</Label>
                  <RadioGroup className="flex space-x-4">
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="staff"
                        id="staff"
                        checked={registerRole === "staff"}
                        onChange={() => setRegisterRole("staff")}
                      />
                      <Label htmlFor="staff" className="text-slate-900 dark:text-white">Staff</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem
                        value="admin"
                        id="admin"
                        checked={registerRole === "admin"}
                        onChange={() => {
                          setRegisterRole("admin");
                          setAdminCode("");
                        }}
                      />
                      <Label htmlFor="admin" className="text-slate-900 dark:text-white">Admin</Label>
                    </div>
                  </RadioGroup>
                  {registerRole === "admin" && (
                    <div className="mt-2">
                      <Label htmlFor="adminCode" className="text-slate-900 dark:text-white">Admin Code</Label>
                      <input
                        id="adminCode"
                        type="password"
                        className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 p-2 rounded-sm ml-2"
                        value={adminCode}
                        onChange={e => setAdminCode(e.target.value)}
                        placeholder="Enter admin invite code"
                        required
                      />
                    </div>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department" className="text-slate-900 dark:text-white">Department</Label>
                  <Select value={registerDepartment} onValueChange={setRegisterDepartment} required>
                    <SelectTrigger className="bg-white dark:bg-slate-800 border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white">
                      <SelectValue placeholder="Select a department" className="text-slate-400 dark:text-slate-500" />
                    </SelectTrigger>
                    <SelectContent>
                      {departments.map((dept) => (
                        <SelectItem key={dept.id} value={dept.id}>
                          {dept.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full bg-primary text-white hover:bg-primary/90 focus:ring-2 focus:ring-primary dark:bg-blue-800 dark:text-white dark:hover:bg-blue-700 dark:focus:ring-2 dark:focus:ring-blue-600 transition-colors" disabled={isRegistering}>
                  {isRegistering ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Registering...
                    </>
                  ) : (
                    "Register"
                  )}
                </Button>
              </CardFooter>
            </form>
          </TabsContent>
        </Tabs>
      </Card>
    </div>
  )
}
