"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

export default function PromotionsPage() {
  const [promotions, setPromotions] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [showNewPromo, setShowNewPromo] = useState(false)
  const [newPromo, setNewPromo] = useState({
    title: "",
    description: "",
    discount_percentage: 0,
    start_date: "",
    end_date: "",
  })

  useEffect(() => {
    fetchPromotions()
  }, [])

  const fetchPromotions = async () => {
    const supabase = createClient()
    const { data, error } = await supabase.from("promotions").select("*").order("created_at", { ascending: false })

    if (!error) {
      setPromotions(data || [])
    }
    setLoading(false)
  }

  const handleCreatePromotion = async () => {
    const supabase = createClient()
    const { error } = await supabase.from("promotions").insert([newPromo])

    if (!error) {
      setNewPromo({ title: "", description: "", discount_percentage: 0, start_date: "", end_date: "" })
      setShowNewPromo(false)
      fetchPromotions()
    }
  }

  const handleDeletePromotion = async (id: string) => {
    const supabase = createClient()
    const { error } = await supabase.from("promotions").delete().eq("id", id)

    if (!error) {
      fetchPromotions()
    }
  }

  if (loading) return <div>Loading...</div>

  const activePromotions = promotions.filter((p) => {
    const now = new Date()
    const start = new Date(p.start_date)
    const end = new Date(p.end_date)
    return now >= start && now <= end
  })

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Platform Promotions</h1>
          <p className="text-muted-foreground">Manage discounts and special campaigns</p>
        </div>
        <Button onClick={() => setShowNewPromo(!showNewPromo)}>{showNewPromo ? "Cancel" : "+ New Promotion"}</Button>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Active Promotions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activePromotions.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">Total Promotions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{promotions.length}</div>
          </CardContent>
        </Card>
      </div>

      {showNewPromo && (
        <Card>
          <CardHeader>
            <CardTitle>Create New Promotion</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Promotion Title"
              value={newPromo.title}
              onChange={(e) => setNewPromo({ ...newPromo, title: e.target.value })}
            />
            <Textarea
              placeholder="Description"
              value={newPromo.description}
              onChange={(e) => setNewPromo({ ...newPromo, description: e.target.value })}
            />
            <div className="grid md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium">Discount %</label>
                <Input
                  type="number"
                  value={newPromo.discount_percentage}
                  onChange={(e) => setNewPromo({ ...newPromo, discount_percentage: Number.parseInt(e.target.value) })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Start Date</label>
                <Input
                  type="date"
                  value={newPromo.start_date}
                  onChange={(e) => setNewPromo({ ...newPromo, start_date: e.target.value })}
                />
              </div>
              <div>
                <label className="text-sm font-medium">End Date</label>
                <Input
                  type="date"
                  value={newPromo.end_date}
                  onChange={(e) => setNewPromo({ ...newPromo, end_date: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleCreatePromotion} className="w-full">
              Create Promotion
            </Button>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Promotions</CardTitle>
          <CardDescription>Active and inactive promotions</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {promotions.map((promo) => {
              const now = new Date()
              const start = new Date(promo.start_date)
              const end = new Date(promo.end_date)
              const isActive = now >= start && now <= end

              return (
                <div key={promo.id} className="flex items-center justify-between p-4 border border-border rounded-lg">
                  <div className="flex-1">
                    <h4 className="font-semibold">{promo.title}</h4>
                    <p className="text-sm text-muted-foreground">{promo.description}</p>
                    <div className="flex gap-2 mt-2">
                      <Badge variant={isActive ? "default" : "secondary"}>{isActive ? "Active" : "Inactive"}</Badge>
                      <Badge variant="outline">{promo.discount_percentage}% OFF</Badge>
                    </div>
                  </div>
                  <Button variant="destructive" size="sm" onClick={() => handleDeletePromotion(promo.id)}>
                    Delete
                  </Button>
                </div>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
