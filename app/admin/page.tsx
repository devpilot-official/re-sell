import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AdminDashboard() {
  const supabase = await createServerClient()

  const [
    { count: usersCount },
    { count: listingsCount },
    { count: transactionsCount },
    { count: disputesCount },
    { data: pendingModeration },
    { data: auditLogs },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("listings").select("id", { count: "exact", head: true }),
    supabase.from("transactions").select("id", { count: "exact", head: true }),
    supabase.from("disputes").select("id", { count: "exact", head: true }).eq("status", "open"),
    supabase.from("moderation_queue").select("*").eq("status", "pending").limit(10),
    supabase.from("admin_logs").select("*").order("created_at", { ascending: false }).limit(5),
  ])

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <p className="text-muted-foreground">Platform overview and management</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{usersCount || 0}</div>
            <p className="text-xs text-muted-foreground">Active users</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{listingsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Current items</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{transactionsCount || 0}</div>
            <p className="text-xs text-muted-foreground">Completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Open Disputes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{disputesCount || 0}</div>
            <p className="text-xs text-muted-foreground">Needs resolution</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{pendingModeration?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Items to moderate</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Link href="/admin/moderation">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                Review Moderation Queue ({pendingModeration?.length || 0})
              </Button>
            </Link>
            <Link href="/admin/disputes">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                Resolve Disputes ({disputesCount || 0})
              </Button>
            </Link>
            <Link href="/admin/users">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                Manage Users ({usersCount || 0})
              </Button>
            </Link>
            <Link href="/admin/promotions">
              <Button variant="outline" className="w-full justify-start bg-transparent">
                Platform Promotions
              </Button>
            </Link>
          </CardContent>
        </Card>

        {/* Recent Admin Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent Admin Activity</CardTitle>
            <CardDescription>Latest administrative actions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {auditLogs && auditLogs.length > 0 ? (
                auditLogs.map((log: any) => (
                  <div key={log.id} className="flex items-start justify-between pb-4 border-b last:border-b-0">
                    <div>
                      <p className="font-medium text-sm">{log.action}</p>
                      <p className="text-xs text-muted-foreground">
                        {log.target_table} • {new Date(log.created_at).toLocaleDateString()}
                      </p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {log.action}
                    </Badge>
                  </div>
                ))
              ) : (
                <p className="text-muted-foreground text-sm">No recent activity</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
