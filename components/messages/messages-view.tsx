"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

interface MessagesViewProps {
  userId: string
  initialListingId?: string
}

export default function MessagesView({ userId, initialListingId }: MessagesViewProps) {
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [selectedConversation, setSelectedConversation] = useState<{
    listing_id: string
    other_user_id: string
  } | null>(null)
  const [listing, setListing] = useState<any>(null)
  const [otherUser, setOtherUser] = useState<any>(null)

  const supabase = createClient()

  // Load initial conversation if provided
  useEffect(() => {
    if (initialListingId) {
      setSelectedConversation({
        listing_id: initialListingId,
        other_user_id: "", // Will be set when fetching listing seller
      })
    }
  }, [initialListingId])

  // Fetch messages for selected conversation
  useEffect(() => {
    if (!selectedConversation) return

    const fetchMessages = async () => {
      // If other_user_id is empty, fetch from listing
      if (!selectedConversation.other_user_id) {
        const { data: listingData } = await supabase
          .from("listings")
          .select("seller_id")
          .eq("id", selectedConversation.listing_id)
          .single()

        if (listingData) {
          const sellerId = listingData.seller_id
          setSelectedConversation((prev) => ({
            ...prev!,
            other_user_id: sellerId,
          }))
        }
      }

      // Fetch listing details
      const { data: listingData } = await supabase
        .from("listings")
        .select("*")
        .eq("id", selectedConversation.listing_id)
        .single()
      setListing(listingData)

      // Fetch other user details
      const { data: userData } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", selectedConversation.other_user_id)
        .single()
      setOtherUser(userData)

      // Fetch messages
      const { data: messagesData } = await supabase
        .from("messages")
        .select("*")
        .eq("listing_id", selectedConversation.listing_id)
        .or(
          `and(sender_id.eq.${userId},receiver_id.eq.${selectedConversation.other_user_id}),and(sender_id.eq.${selectedConversation.other_user_id},receiver_id.eq.${userId})`,
        )
        .order("created_at", { ascending: true })

      setMessages(messagesData || [])

      // Mark as read
      await supabase
        .from("messages")
        .update({ read: true })
        .eq("listing_id", selectedConversation.listing_id)
        .eq("receiver_id", userId)
    }

    fetchMessages()
  }, [selectedConversation, userId, supabase])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedConversation) return

    setIsLoading(true)
    try {
      const { error } = await supabase.from("messages").insert({
        listing_id: selectedConversation.listing_id,
        sender_id: userId,
        receiver_id: selectedConversation.other_user_id,
        content: newMessage,
      })

      if (error) throw error
      setNewMessage("")

      // Refresh messages
      const { data } = await supabase
        .from("messages")
        .select("*")
        .eq("listing_id", selectedConversation.listing_id)
        .or(
          `and(sender_id.eq.${userId},receiver_id.eq.${selectedConversation.other_user_id}),and(sender_id.eq.${selectedConversation.other_user_id},receiver_id.eq.${userId})`,
        )
        .order("created_at", { ascending: true })

      setMessages(data || [])
    } catch (error) {
      console.error("Error sending message:", error)
    } finally {
      setIsLoading(false)
    }
  }

  if (!selectedConversation) {
    return (
      <Card className="border-border/50 text-center py-12">
        <CardContent>
          <p className="text-muted-foreground">Select a conversation or create a new message</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="border-border/50 flex flex-col h-96">
      {/* Header */}
      <CardHeader className="border-b border-border">
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-lg">{listing?.title}</CardTitle>
            <p className="text-sm text-muted-foreground mt-1">{otherUser?.full_name}</p>
          </div>
        </div>
      </CardHeader>

      {/* Messages */}
      <CardContent className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <p className="text-center text-muted-foreground">No messages yet. Start the conversation!</p>
        ) : (
          messages.map((msg) => (
            <div key={msg.id} className={`flex ${msg.sender_id === userId ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-xs px-4 py-2 rounded-lg ${
                  msg.sender_id === userId
                    ? "bg-primary text-primary-foreground rounded-br-none"
                    : "bg-muted text-foreground rounded-bl-none"
                }`}
              >
                <p className="text-sm">{msg.content}</p>
                <p className="text-xs mt-1 opacity-70">
                  {new Date(msg.created_at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
            </div>
          ))
        )}
      </CardContent>

      {/* Input */}
      <form onSubmit={handleSendMessage} className="border-t border-border p-4 flex gap-2">
        <Input
          type="text"
          placeholder="Type your message..."
          value={newMessage}
          onChange={(e) => setNewMessage(e.target.value)}
          disabled={isLoading}
        />
        <Button type="submit" className="bg-primary hover:bg-primary/90" disabled={isLoading || !newMessage.trim()}>
          Send
        </Button>
      </form>
    </Card>
  )
}
