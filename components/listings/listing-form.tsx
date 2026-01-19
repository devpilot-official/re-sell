"use client"

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import ImageUpload from "./image-upload"

const CATEGORIES = [
  "Fashion",
  "Electronics",
  "Home & Living",
  "Sports & Outdoors",
  "Books & Media",
  "Toys & Games",
  "Beauty & Health",
  "Automotive",
  "Jewelry & Watches",
  "Other",
]
const CONDITIONS = ["New with Tags", "New Without Tags", "Like New", "Excellent", "Good", "Fair"]

interface ListingFormProps {
  userId: string
}

export default function ListingForm({ userId }: ListingFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [images, setImages] = useState<Array<{ id: string; image_url: string; is_primary: boolean }>>([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Fashion",
    brand: "",
    size: "",
    condition: "Excellent",
    price: "",
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setMessage(null)

    try {
      if (!formData.title || !formData.price || !formData.description) {
        throw new Error("Please fill in all required fields")
      }

      if (images.length === 0) {
        throw new Error("Please upload at least one image")
      }

      const { data: listing, error } = await supabase
        .from("listings")
        .insert({
          seller_id: userId,
          title: formData.title,
          description: formData.description,
          category: formData.category,
          brand: formData.brand,
          size: formData.size,
          condition: formData.condition,
          price: Number.parseFloat(formData.price),
          status: "active",
        })
        .select()
        .single()

      if (error) throw error

      setMessage({ type: "success", text: "Item listed successfully!" })
      router.push(`/dashboard/sales`)
    } catch (error: unknown) {
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to create listing",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Upload Product Images</CardTitle>
          <CardDescription>Add photos of your item (at least 1, up to 10)</CardDescription>
        </CardHeader>
        <CardContent>
          <ImageUpload listingId="new" onImagesUpdate={setImages} />
        </CardContent>
      </Card>

      <Card className="border-border/50">
        <CardHeader>
          <CardTitle>Item Details</CardTitle>
          <CardDescription>Provide accurate information to attract buyers</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="title">Item Title *</Label>
              <Input
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="e.g., Samsung Galaxy S21 - Excellent Condition"
                required
              />
              <p className="text-xs text-muted-foreground">Be specific and descriptive</p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="category">Category *</Label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  {CATEGORIES.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="brand">Brand</Label>
                <Input
                  id="brand"
                  name="brand"
                  value={formData.brand}
                  onChange={handleChange}
                  placeholder="e.g., Samsung, Nike, Local Designer"
                />
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="size">Size</Label>
                <Input
                  id="size"
                  name="size"
                  value={formData.size}
                  onChange={handleChange}
                  placeholder="e.g., M, Large, 128GB"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="condition">Condition *</Label>
                <select
                  id="condition"
                  name="condition"
                  value={formData.condition}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                >
                  {CONDITIONS.map((cond) => (
                    <option key={cond} value={cond}>
                      {cond}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (NGN) *</Label>
              <div className="flex gap-2">
                <span className="flex items-center text-muted-foreground">₦</span>
                <Input
                  id="price"
                  name="price"
                  type="number"
                  value={formData.price}
                  onChange={handleChange}
                  placeholder="0.00"
                  step="0.01"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Describe the item, condition, any defects, why you're selling, etc."
                rows={6}
                required
              />
              <p className="text-xs text-muted-foreground">Include details that help buyers make decisions</p>
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
              {isLoading ? "Creating Listing..." : "List Item"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
