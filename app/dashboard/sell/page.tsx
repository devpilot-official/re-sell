import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import ListingForm from "@/components/listings/listing-form"
import Link from "next/link"

export default async function SellPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

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
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-2">List a New Item</h1>
        <p className="text-muted-foreground mb-8">Fill in the details below to start selling</p>
        <ListingForm userId={user.id} />
      </div>
    </div>
  )
}
