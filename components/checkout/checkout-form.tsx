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

interface CheckoutFormProps {
  listing: any
  userId: string
}

const PAYMENT_METHODS = ["Bank Transfer", "Mobile Money", "Card Payment"]

export default function CheckoutForm({ listing, userId }: CheckoutFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    payment_method: "Bank Transfer",
    shipping_address: "",
    phone: "",
    note_to_seller: "",
  })
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      if (!formData.shipping_address || !formData.phone) {
        throw new Error("Please fill in all required fields")
      }

      const { data: transaction, error: transactionError } = await supabase
        .from("transactions")
        .insert({
          listing_id: listing.id,
          buyer_id: userId,
          seller_id: listing.seller_id,
          amount: listing.price,
          currency: listing.currency,
          payment_method: formData.payment_method,
          status: "pending",
          payment_reference: `TXN-${Date.now()}`,
        })
        .select()
        .single()

      if (transactionError) throw transactionError

      // Mark listing as sold
      await supabase.from("listings").update({ status: "sold" }).eq("id", listing.id)

      setSuccess(true)
      setTimeout(() => {
        router.push(`/dashboard/purchases`)
      }, 2000)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "Failed to complete purchase")
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="border-border/50 border-2 border-primary/30">
        <CardContent className="p-8 text-center">
          <div className="text-5xl mb-4">✓</div>
          <h2 className="text-2xl font-bold mb-2">Purchase Confirmed!</h2>
          <p className="text-muted-foreground mb-4">
            Your transaction has been created. The seller will be notified and you can track your order in your
            dashboard.
          </p>
          <p className="text-sm text-muted-foreground">Redirecting to your purchases...</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid md:grid-cols-3 gap-8">
      {/* Form */}
      <div className="md:col-span-2">
        <Card className="border-border/50">
          <CardHeader>
            <CardTitle>Shipping & Payment Details</CardTitle>
            <CardDescription>Provide your delivery and payment information</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Shipping */}
              <div className="space-y-4">
                <h3 className="font-bold">Shipping Information</h3>
                <div className="space-y-2">
                  <Label htmlFor="shipping_address">Delivery Address *</Label>
                  <Textarea
                    id="shipping_address"
                    name="shipping_address"
                    value={formData.shipping_address}
                    onChange={handleChange}
                    placeholder="Enter your full delivery address including city, state, and postal code"
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number *</Label>
                  <Input
                    id="phone"
                    name="phone"
                    type="tel"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+234 (0) 901 234 5678"
                    required
                  />
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-4">
                <h3 className="font-bold">Payment Method</h3>
                <div className="space-y-2">
                  <Label htmlFor="payment_method">Choose Payment Method *</Label>
                  <select
                    id="payment_method"
                    name="payment_method"
                    value={formData.payment_method}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-input rounded-md bg-background text-foreground"
                  >
                    {PAYMENT_METHODS.map((method) => (
                      <option key={method} value={method}>
                        {method}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-muted-foreground">
                    Your funds will be held in escrow until you confirm receipt
                  </p>
                </div>
              </div>

              {/* Message to Seller */}
              <div className="space-y-4">
                <h3 className="font-bold">Message (Optional)</h3>
                <div className="space-y-2">
                  <Label htmlFor="note_to_seller">Note to Seller</Label>
                  <Textarea
                    id="note_to_seller"
                    name="note_to_seller"
                    value={formData.note_to_seller}
                    onChange={handleChange}
                    placeholder="Any special requests or questions for the seller..."
                    rows={3}
                  />
                </div>
              </div>

              {error && (
                <div className="p-3 rounded-md text-sm bg-destructive/10 text-destructive border border-destructive/30">
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full bg-primary hover:bg-primary/90" disabled={isLoading}>
                {isLoading ? "Processing..." : "Complete Purchase"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Order Summary */}
      <div className="md:col-span-1">
        <Card className="border-border/50 sticky top-24">
          <CardHeader>
            <CardTitle>Order Summary</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg h-40 flex items-center justify-center mb-4">
              <div className="text-center">
                <div className="text-4xl mb-2">👗</div>
                <p className="text-xs text-muted-foreground">{listing.category}</p>
              </div>
            </div>

            <div>
              <p className="text-sm font-medium text-muted-foreground">Item</p>
              <h3 className="font-bold line-clamp-2 mb-2">{listing.title}</h3>
              <p className="text-xs text-muted-foreground">{listing.brand}</p>
            </div>

            <div className="border-t border-border pt-4 space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Item Price</span>
                <span className="font-bold">₦{listing.price.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Shipping</span>
                <span className="text-sm text-muted-foreground">Est. ₦1,500</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted-foreground">Service Fee (2%)</span>
                <span className="text-sm text-muted-foreground">₦{(listing.price * 0.02).toLocaleString()}</span>
              </div>
            </div>

            <div className="border-t border-border pt-4 flex justify-between">
              <span className="font-bold">Total</span>
              <span className="text-lg font-bold text-primary">
                ₦{(listing.price + 1500 + listing.price * 0.02).toLocaleString()}
              </span>
            </div>

            <div className="bg-muted p-3 rounded-lg">
              <p className="text-xs text-muted-foreground">
                <strong>Buyer Protection:</strong> Payment held in escrow until you confirm receipt.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
