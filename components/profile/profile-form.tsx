"use client"

import type React from "react"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"

interface ProfileFormProps {
  profile: any
  userId: string
}

export default function ProfileForm({ profile, userId }: ProfileFormProps) {
  const [formData, setFormData] = useState({
    full_name: profile?.full_name || "",
    phone: profile?.phone || "",
    location: profile?.location || "",
    bio: profile?.bio || "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setMessage(null)

    try {
      const { error } = await supabase.from("profiles").update(formData).eq("id", userId)

      if (error) throw error
      setMessage({ type: "success", text: "Profile updated successfully!" })
    } catch (error: unknown) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to update profile",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Basic Info */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>Update your profile details</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="full_name">Full Name</Label>
              <Input
                id="full_name"
                name="full_name"
                value={formData.full_name}
                onChange={handleChange}
                placeholder="John Doe"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="+234 (0) 901 234 5678"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="location">Location (City)</Label>
              <Input
                id="location"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="Lagos, Nigeria"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell buyers about yourself..."
                className="resize-none"
                rows={4}
              />
            </div>

            {message && (
              <div
                className={`p-3 rounded-md text-sm ${
                  message.type === "success"
                    ? "bg-green-50 text-green-800 border border-green-200"
                    : "bg-red-50 text-red-800 border border-red-200"
                }`}
              >
                {message.text}
              </div>
            )}

            <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Seller Stats */}
      {profile && (
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Seller Statistics</CardTitle>
            <CardDescription>Your marketplace performance</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Seller Rating</p>
                <p className="text-2xl font-bold text-primary">{profile.seller_rating || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Buyer Rating</p>
                <p className="text-2xl font-bold text-primary">{profile.buyer_rating || "N/A"}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Sales</p>
                <p className="text-2xl font-bold">{profile.total_sales || 0}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground mb-1">Total Purchases</p>
                <p className="text-2xl font-bold">{profile.total_purchases || 0}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Verification Status */}
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Verification Status</CardTitle>
          <CardDescription>Build trust with buyers</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm">Email Verified</span>
              <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded">Verified</span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm">Phone Number</span>
              <span className="text-xs bg-muted-foreground/20 text-muted-foreground px-2 py-1 rounded">
                {profile?.phone ? "Verified" : "Pending"}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
              <span className="text-sm">National ID</span>
              <span className="text-xs bg-muted-foreground/20 text-muted-foreground px-2 py-1 rounded">Optional</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
