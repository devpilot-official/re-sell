"use client"

import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"

interface ListingActionsProps {
  listingId: string
  sellerId: string
}

export default function ListingActions({ listingId, sellerId }: ListingActionsProps) {
  const router = useRouter()
  const [user, setUser] = useState<any>(null)

  useEffect(() => {
    const supabase = createClient()
    supabase.auth.getUser().then(({ data }) => {
      setUser(data.user)
    })
  }, [])

  const handleBuyNow = () => {
    if (!user) {
      router.push("/auth/login")
      return
    }
    if (user.id === sellerId) {
      alert("You can't buy your own item!")
      return
    }
    router.push(`/checkout/${listingId}`)
  }

  const handleContactSeller = () => {
    if (!user) {
      router.push("/auth/login")
      return
    }
    router.push(`/dashboard/messages?listing=${listingId}`)
  }

  return (
    <div className="flex gap-4">
      <Button className="flex-1 bg-primary hover:bg-primary/90" onClick={handleBuyNow}>
        Buy Now
      </Button>
      <Button variant="outline" className="flex-1 bg-transparent" onClick={handleContactSeller}>
        Message Seller
      </Button>
    </div>
  )
}
