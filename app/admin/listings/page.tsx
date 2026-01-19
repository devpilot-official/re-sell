"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

export default function ListingsManagementPage() {
  const [listings, setListings] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")

  useEffect(() => {
    fetchListings()
  }, [])

  const fetchListings = async () => {
    const supabase = createClient()
    let query = supabase
      .from("listings")
      .select("*, seller:profiles(full_name, email)")
      .order("created_at", { ascending: false })

    if (filterStatus !== "all") {
      query = query.eq("status", filterStatus)
    }

    const { data, error } = await query

    if (!error) {
      setListings(data || [])
    }
    setLoading(false)
  }

  const handleRemoveListing = async (listingId: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("listings").delete().eq("id", listingId)

    if (!error) {
      fetchListings()
    }
  }

  const filteredListings = listings.filter(
    (listing) =>
      listing.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      listing.seller?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  if (loading) return <div>Loading...</div>

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Listings Management</h1>
        <p className="text-muted-foreground">Review and manage all platform listings</p>
      </div>

      <div className="flex gap-4">
        <div className="flex-1">
          <Input
            placeholder="Search listings by title or seller..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <select
          value={filterStatus}
          onChange={(e) => {
            setFilterStatus(e.target.value)
            fetchListings()
          }}
          className="px-4 py-2 border border-border rounded-lg bg-background"
        >
          <option value="all">All Status</option>
          <option value="active">Active</option>
          <option value="sold">Sold</option>
          <option value="removed">Removed</option>
        </select>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Listings ({filteredListings.length})</CardTitle>
          <CardDescription>Active and inactive listings on the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-3 px-4">Title</th>
                  <th className="text-left py-3 px-4">Seller</th>
                  <th className="text-left py-3 px-4">Category</th>
                  <th className="text-left py-3 px-4">Price</th>
                  <th className="text-left py-3 px-4">Status</th>
                  <th className="text-left py-3 px-4">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredListings.map((listing) => (
                  <tr key={listing.id} className="border-b border-border hover:bg-muted/50">
                    <td className="py-3 px-4 font-medium truncate">{listing.title}</td>
                    <td className="py-3 px-4">{listing.seller?.full_name || "—"}</td>
                    <td className="py-3 px-4">{listing.category}</td>
                    <td className="py-3 px-4">₦{listing.price?.toLocaleString()}</td>
                    <td className="py-3 px-4">
                      <Badge variant={listing.status === "active" ? "default" : "secondary"}>{listing.status}</Badge>
                    </td>
                    <td className="py-3 px-4">
                      <Button size="sm" variant="destructive" onClick={() => handleRemoveListing(listing.id)}>
                        Remove
                      </Button>
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
