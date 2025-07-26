import React, { useEffect, useState } from "react";
import { Button } from "./ui/button";
import { Card, CardHeader, CardTitle, CardContent } from "./ui/card";
import { useAuth } from "../lib/auth-context";

export default function PromoteUserCard() {
  const { user } = useAuth();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [promoting, setPromoting] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  useEffect(() => {
    if (user?.role === "admin") {
      fetchUsers();
    }
    // eslint-disable-next-line
  }, [user]);

  async function fetchUsers() {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/users/department", {
        headers: {
          "x-auth-token": localStorage.getItem("taskyToken"),
        },
        credentials: "include",
      });
      const data = await res.json();
      setUsers(data.filter(u => u.role === "staff"));
    } catch (err) {
      setError("Failed to fetch users");
    } finally {
      setLoading(false);
    }
  }

  async function promoteUser(userId) {
    setPromoting(userId);
    setError("");
    setSuccess("");
    try {
      const res = await fetch(`/api/users/${userId}/promote`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "x-auth-token": localStorage.getItem("taskyToken"),
        },
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || "Failed to promote user");
      }
      setSuccess("User promoted to admin!");
      fetchUsers();
    } catch (err) {
      setError(err.message);
    } finally {
      setPromoting("");
    }
  }

  if (user?.role !== "admin") return null;

  return (
    <Card className="mt-8">
      <CardHeader>
        <CardTitle>Promote Staff to Admin</CardTitle>
      </CardHeader>
      <CardContent>
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {success && <div className="text-green-600 mb-2">{success}</div>}
        {loading ? (
          <div>Loading users...</div>
        ) : users.length === 0 ? (
          <div className="text-muted-foreground">No staff users available for promotion.</div>
        ) : (
          <ul className="space-y-3">
            {users.map(u => (
              <li key={u.id} className="flex items-center justify-between">
                <span>{u.name} ({u.email})</span>
                <Button
                  size="sm"
                  disabled={promoting === u.id}
                  onClick={() => promoteUser(u.id)}
                >
                  {promoting === u.id ? "Promoting..." : "Promote to Admin"}
                </Button>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
