"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

export default function AuditLogsPage() {
  const [logs, setLogs] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchLogs()
  }, [])

  const fetchLogs = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("admin_logs")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(200)

    if (!error) {
      setLogs(data || [])
    }
    setLoading(false)
  }

  const filteredLogs = logs.filter(
    (log) =>
      log.action?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.target_table?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      log.admin_email?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Audit Logs</h1>
        <p className="text-muted-foreground">Complete record of all admin actions and system events</p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-sm font-medium">Total Log Entries</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{logs.length}</div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Audit Trail</CardTitle>
          <CardDescription>All administrative actions logged for compliance</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input placeholder="Search logs..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">Action</th>
                  <th className="text-left py-3 px-4">Table</th>
                  <th className="text-left py-3 px-4">Admin</th>
                  <th className="text-left py-3 px-4">Timestamp</th>
                </tr>
              </thead>
              <tbody>
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4">
                      <Badge variant="outline">{log.action}</Badge>
                    </td>
                    <td className="py-3 px-4 text-muted-foreground">{log.target_table}</td>
                    <td className="py-3 px-4">{log.admin_email || "System"}</td>
                    <td className="py-3 px-4">{new Date(log.created_at).toLocaleString()}</td>
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
