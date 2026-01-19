import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import MessagesView from "@/components/messages/messages-view"

export default async function MessagesPage({
  searchParams,
}: {
  searchParams: Promise<{ listing?: string }>
}) {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  const params = await searchParams

  const { data: conversations } = await supabase
    .from("messages")
    .select(`
      id,
      listing_id,
      sender_id,
      receiver_id,
      content,
      read,
      created_at,
      listing:listings(title),
      sender:profiles(id, full_name, avatar_url),
      receiver:profiles(id, full_name, avatar_url)
    `)
    .or(`sender_id.eq.${user.id},receiver_id.eq.${user.id}`)
    .order("created_at", { ascending: false })

  // Group messages by conversation (listing + other party)
  const groupedConversations = new Map()
  conversations?.forEach((msg) => {
    const otherUserId = msg.sender_id === user.id ? msg.receiver_id : msg.sender_id
    const key = `${msg.listing_id}-${otherUserId}`
    if (!groupedConversations.has(key)) {
      groupedConversations.set(key, {
        listing_id: msg.listing_id,
        listing_title: msg.listing?.title,
        other_user_id: otherUserId,
        other_user_name: msg.sender_id === user.id ? msg.receiver?.full_name : msg.sender?.full_name,
        last_message: msg.content,
        last_message_time: msg.created_at,
        unread: msg.receiver_id === user.id && !msg.read,
      })
    }
  })

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/dashboard" className="text-2xl font-bold text-primary">
              Preloved
            </Link>
            <div className="flex items-center gap-4">
              <form action="/auth/logout" method="POST">
                <button type="submit" className="text-sm text-muted-foreground hover:text-foreground">
                  Logout
                </button>
              </form>
            </div>
          </div>
        </div>
      </nav>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-4 gap-6">
          {/* Conversations List */}
          <aside className="md:col-span-1">
            <h2 className="font-bold mb-4">Conversations</h2>
            <div className="space-y-2">
              {groupedConversations.size > 0 ? (
                Array.from(groupedConversations.values()).map((conv: any) => (
                  <Link
                    key={`${conv.listing_id}-${conv.other_user_id}`}
                    href={`/dashboard/messages?listing=${conv.listing_id}&user=${conv.other_user_id}`}
                  >
                    <div className="p-3 border border-border rounded-lg hover:bg-muted cursor-pointer">
                      <p className="text-sm font-medium line-clamp-1">{conv.listing_title}</p>
                      <p className="text-xs text-muted-foreground">{conv.other_user_name}</p>
                      <p className="text-xs text-muted-foreground line-clamp-1">{conv.last_message}</p>
                    </div>
                  </Link>
                ))
              ) : (
                <p className="text-sm text-muted-foreground p-3">No conversations yet</p>
              )}
            </div>
          </aside>

          {/* Messages */}
          <div className="md:col-span-3">
            <MessagesView userId={user.id} initialListingId={params.listing} />
          </div>
        </div>
      </div>
    </div>
  )
}
