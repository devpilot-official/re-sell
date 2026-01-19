import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import CheckoutForm from "@/components/checkout/checkout-form"

export default async function CheckoutPage({
  params,
}: {
  params: Promise<{ listingId: string }>
}) {
  const { listingId } = await params
  const supabase = await createClient()

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()
  if (userError || !user) {
    redirect("/auth/login")
  }

  const { data: listing } = await supabase
    .from("listings")
    .select(`
      *,
      seller:profiles(id, full_name, email)
    `)
    .eq("id", listingId)
    .single()

  if (!listing || listing.status !== "active") {
    redirect("/browse")
  }

  if (listing.seller_id === user.id) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-primary">
              Preloved
            </Link>
          </div>
        </div>
      </nav>

      {/* Main */}
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Complete Your Purchase</h1>
        <CheckoutForm listing={listing} userId={user.id} />
      </div>
    </div>
  )
}
