"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"

export default function DisputesPage() {
  const [disputes, setDisputes] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedDispute, setSelectedDispute] = useState<any>(null)
  const [resolutionNotes, setResolutionNotes] = useState("")

  useEffect(() => {
    fetchDisputes()
  }, [])

  const fetchDisputes = async () => {
    const supabase = createClient()
    const { data, error } = await supabase
      .from("disputes")
      .select("*, transaction:transactions(*, buyer:profiles(full_name), seller:profiles(full_name))")
      .order("created_at", { ascending: false })

    if (!error) {
      setDisputes(data || [])
    }
    setLoading(false)
  }

  const handleResolveDispute = async (status: "resolved" | "refunded") => {
    const supabase = createClient()
    const { error } = await supabase
      .from("disputes")
      .update({
        status,
        resolved_at: new Date().toISOString(),
        resolution_notes: resolutionNotes,
      })
      .eq("id", selectedDispute.id)

    if (!error) {
      setSelectedDispute(null)
      setResolutionNotes("")
      fetchDisputes()
    }
  }

  if (loading) return <div>Loading...</div>

  const openDisputes = disputes.filter((d) => d.status === "open")

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dispute Resolution</h1>
        <p className="text-muted-foreground">Handle buyer-seller disputes and issues</p>
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Disputes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{disputes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Open</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{openDisputes.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Resolved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{disputes.length - openDisputes.length}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Disputes List */}
        <div>
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Disputes ({openDisputes.length})</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {openDisputes.map((dispute) => (
                <button
                  key={dispute.id}
                  onClick={() => setSelectedDispute(dispute)}
                  className={`w-full text-left p-3 rounded-lg border transition ${
                    selectedDispute?.id === dispute.id ? "border-primary bg-primary/5" : "border-border hover:bg-muted"
                  }`}
                >
                  <p className="font-medium text-sm truncate">{dispute.reason}</p>
                  <p className="text-xs text-muted-foreground">{new Date(dispute.created_at).toLocaleDateString()}</p>
                </button>
              ))}
            </CardContent>
          </Card>
        </div>

        {/* Details */}
        <div className="lg:col-span-2">
          {selectedDispute ? (
            <Card>
              <CardHeader>
                <CardTitle>Dispute Details</CardTitle>
                <CardDescription>#{selectedDispute.id.slice(0, 8)}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="font-medium text-sm mb-1">Status</h3>
                    <Badge>{selectedDispute.status}</Badge>
                  </div>
                  <div>
                    <h3 className="font-medium text-sm mb-1">Type</h3>
                    <p className="text-sm text-muted-foreground">{selectedDispute.dispute_type}</p>
                  </div>
                </div>

                <div>
                  <h3 className="font-medium text-sm mb-2">Issue Description</h3>
                  <p className="text-sm text-muted-foreground">{selectedDispute.reason}</p>
                </div>

                <div>
                  <label className="text-sm font-medium">Resolution Notes</label>
                  <Textarea
                    value={resolutionNotes}
                    onChange={(e) => setResolutionNotes(e.target.value)}
                    placeholder="Document your resolution decision..."
                    rows={4}
                    className="mt-2"
                  />
                </div>

                <div className="flex gap-2 pt-4">
                  <Button onClick={() => handleResolveDispute("resolved")} className="flex-1">
                    Resolve
                  </Button>
                  <Button onClick={() => handleResolveDispute("refunded")} variant="outline" className="flex-1">
                    Issue Refund
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center text-muted-foreground">Select a dispute to review</CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
