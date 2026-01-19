"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

export default function ModerationQueuePage() {
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedItem, setSelectedItem] = useState<any>(null)
  const [resolutionNotes, setResolutionNotes] = useState("")

  useEffect(() => {
    fetchModerationQueue()
  }, [])

  const fetchModerationQueue = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("moderation_queue")
      .select("*")
      .eq("status", "pending")
      .order("created_at", { ascending: false })

    if (!error) {
      setItems(data || [])
    }
    setLoading(false)
  }

  const handleApprove = async () => {
    const supabase = createClient()
    const { error } = await supabase
      .from("moderation_queue")
      .update({
        status: "approved",
        resolved_at: new Date().toISOString(),
        resolution_notes: resolutionNotes,
      })
      .eq("id", selectedItem.id)

    if (!error) {
      setSelectedItem(null)
      setResolutionNotes("")
      fetchModerationQueue()
    }
  }

  const handleReject = async () => {
    const supabase = createClient()
    const { error } = await supabase
      .from("moderation_queue")
      .update({
        status: "rejected",
        resolved_at: new Date().toISOString(),
        resolution_notes: resolutionNotes,
      })
      .eq("id", selectedItem.id)

    if (!error) {
      setSelectedItem(null)
      setResolutionNotes("")
      fetchModerationQueue()
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Moderation Queue</h1>
        <p className="text-muted-foreground">Review flagged items and reports</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items list */}
        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Pending Items ({items.length})</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {items.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => setSelectedItem(item)}
                    className={`w-full text-left p-3 rounded-lg border transition ${
                      selectedItem?.id === item.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                    }`}
                  >
                    <p className="font-medium text-sm truncate">{item.reason}</p>
                    <p className="text-xs text-muted-foreground">{new Date(item.created_at).toLocaleDateString()}</p>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Details panel */}
        <div className="lg:col-span-2">
          {selectedItem ? (
            <Card>
              <CardHeader>
                <CardTitle>Review Details</CardTitle>
                <CardDescription>{selectedItem.item_type}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-medium text-sm mb-2">Reason for Report</h3>
                    <p className="text-sm text-muted-foreground">{selectedItem.reason}</p>
                  </div>

                  <div>
                    <h3 className="font-medium text-sm mb-2">Status</h3>
                    <Badge>{selectedItem.status}</Badge>
                  </div>

                  <div>
                    <label className="text-sm font-medium">Resolution Notes</label>
                    <Textarea
                      value={resolutionNotes}
                      onChange={(e) => setResolutionNotes(e.target.value)}
                      placeholder="Document your decision and any actions taken..."
                      className="mt-2"
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-2 pt-4">
                    <Button onClick={handleApprove} className="flex-1">
                      Approve
                    </Button>
                    <Button onClick={handleReject} variant="destructive" className="flex-1">
                      Reject
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">Select an item to review</CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
