"use client"

import { useState, useEffect } from "react"
import { Button } from "../components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card"
import { Input } from "../components/ui/input"
import { Label } from "../components/ui/label"
import { RadioGroup, RadioGroupItem } from "../components/ui/radio-group"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "../components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../components/ui/tabs"
import { useToast } from "../hooks/use-toast"
import { departments, useAuth } from "../lib/auth-context"
import { Loader2 } from "lucide-react"
import { useNavigate } from "react-router-dom"

export default function AuthPage() {
  const { user, loading, login, register } = useAuth()
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
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to login",
        variant: "destructive",
      })
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

    setIsRegistering(true)
    try {
      await register({
        name: registerName,
        email: registerEmail,
        password: registerPassword,
        role: registerRole,
        departmentId: registerDepartment,
      })

      toast({
        title: "Success",
        description:
          registerRole === "admin"
            ? "Your admin account has been created"
            : "Your account has been created and is pending approval",
      })

      if (registerRole === "staff") {
        setActiveTab("login")
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to register",
        variant: "destructive",
      })
    } finally {
      setIsRegistering(false)
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
        <Tabs defaultValue="login" value={activeTab} onChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login">Login</TabsTrigger>
            <TabsTrigger value="register">Register</TabsTrigger>
          </TabsList>

          <TabsContent value="login">
            <form onSubmit={handleLogin}>
              <CardHeader>
                <CardTitle>Login</CardTitle>
                <CardDescription>Enter your credentials to access your account</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={loginEmail}
                    onChange={(e) => setLoginEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoggingIn}>
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
                <CardTitle>Register</CardTitle>
                <CardDescription>Create a new account to get started</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    placeholder="John Doe"
                    value={registerName}
                    onChange={(e) => setRegisterName(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-email">Email</Label>
                  <Input
                    id="register-email"
                    type="email"
                    placeholder="your.email@example.com"
                    value={registerEmail}
                    onChange={(e) => setRegisterEmail(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="register-password">Password</Label>
                  <Input
                    id="register-password"
                    type="password"
                    value={registerPassword}
                    onChange={(e) => setRegisterPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
  <Label>Role</Label>
  <RadioGroup className="flex space-x-4">
    <div className="flex items-center space-x-2">
      <RadioGroupItem
        value="staff"
        id="staff"
        checked={registerRole === "staff"}
        onChange={() => setRegisterRole("staff")}
      />
      <Label htmlFor="staff">Staff</Label>
    </div>
    <div className="flex items-center space-x-2">
      <RadioGroupItem
        value="admin"
        id="admin"
        checked={registerRole === "admin"}
        onChange={() => setRegisterRole("admin")}
      />
      <Label htmlFor="admin">Admin</Label>
    </div>
  </RadioGroup>
</div>
<div className="space-y-2">
  <Label htmlFor="department">Department</Label>
  <Select value={registerDepartment} onValueChange={setRegisterDepartment} required>
    <SelectTrigger>
      <SelectValue placeholder="Select a department" />
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
                <Button type="submit" className="w-full" disabled={isRegistering}>
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
