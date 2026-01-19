"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Heart } from "lucide-react"

interface FavoriteButtonProps {
  listingId: string
  userId?: string
}

export default function FavoriteButton({ listingId, userId }: FavoriteButtonProps) {
  const [isFavorited, setIsFavorited] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [currentUser, setCurrentUser] = useState<any>(null)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const getUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()
      setCurrentUser(user)

      if (user) {
        const { data } = await supabase
          .from("favorites")
          .select("id")
          .eq("user_id", user.id)
          .eq("listing_id", listingId)
          .single()

        setIsFavorited(!!data)
      }
    }

    getUser()
  }, [listingId, supabase])

  const handleToggleFavorite = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()

    if (!currentUser) {
      router.push("/auth/login")
      return
    }

    setIsLoading(true)

    try {
      if (isFavorited) {
        await supabase.from("favorites").delete().eq("user_id", currentUser.id).eq("listing_id", listingId)

        setIsFavorited(false)
      } else {
        await supabase.from("favorites").insert({
          user_id: currentUser.id,
          listing_id: listingId,
        })

        setIsFavorited(true)
      }
    } catch (error) {
      console.error("Error toggling favorite:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <button
      onClick={handleToggleFavorite}
      disabled={isLoading}
      className="p-2 rounded-full hover:bg-muted transition disabled:opacity-50"
      aria-label={isFavorited ? "Remove from favorites" : "Add to favorites"}
    >
      <Heart
        size={24}
        className={`transition-colors ${
          isFavorited ? "fill-red-500 text-red-500" : "text-muted-foreground hover:text-red-500"
        }`}
      />
    </button>
  )
}
