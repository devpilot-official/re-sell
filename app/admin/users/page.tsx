"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

export default function UsersManagementPage() {
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchUsers()
  }, [])

  const fetchUsers = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.from("profiles").select("*").order("created_at", { ascending: false })

    if (!error) {
      setUsers(data || [])
    }
    setLoading(false)
  }

  const handleSuspendUser = async (userId: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("profiles").update({ suspicious_activity_flag: true }).eq("id", userId)

    if (!error) {
      fetchUsers()
    }
  }

  const handleVerifyUser = async (userId: string) => {
    const supabase = createClient()
    const { error } = await supabase
      .from("profiles")
      .update({ is_verified: true, verification_status: "verified" })
      .eq("id", userId)

    if (!error) {
      fetchUsers()
    }
  }

  const filteredUsers = users.filter(
    (user) =>
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Management</h1>
        <p className="text-muted-foreground">Manage platform users and verification</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Users</CardTitle>
        </CardHeader>
        <CardContent>
          <Input
            placeholder="Search by name or email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
          <CardDescription>Total users on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">Name</th>
                  <th className="text-left py-3 px-4">Email</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Verification</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4">{user.full_name || "—"}</td>
                    <td className="py-3 px-4">{user.email || "—"}</td>
                    <td className="py-3 px-4">
                      <Badge variant={user.suspicious_activity_flag ? "destructive" : "default"}>
                        {user.suspicious_activity_flag ? "Flagged" : "Active"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Badge variant={user.is_verified ? "default" : "outline"}>
                        {user.is_verified ? "Verified" : "Pending"}
                      </Badge>
                    </td>
                    <td className="py-3 px-4 flex gap-2">
                      {!user.is_verified && (
                        <Button size="sm" variant="outline" onClick={() => handleVerifyUser(user.id)}>
                          Verify
                        </Button>
                      )}
                      {!user.suspicious_activity_flag && (
                        <Button size="sm" variant="destructive" onClick={() => handleSuspendUser(user.id)}>
                          Flag
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
