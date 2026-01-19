import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Header from "@/components/header"
import { Badge } from "@/components/ui/badge"

export default async function ListingsBreakdownPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: listings } = await supabase
    .from("listings")
    .select("*")
    .eq("seller_id", user.id)
    .order("created_at", { ascending: false })

  const activeListings = listings?.filter((l) => l.status === "active") || []
  const soldListings = listings?.filter((l) => l.status === "sold") || []
  const draftListings = listings?.filter((l) => l.status === "draft") || []

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Listings Breakdown</h1>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-primary">{activeListings.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Available for purchase</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Sold Items</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{soldListings.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Successfully sold</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Draft Listings</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-600">{draftListings.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Not published yet</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6">
          {["Active Listings", "Sold Items", "Drafts"].map((category, idx) => {
            const categoryListings =
              category === "Active Listings" ? activeListings : category === "Sold Items" ? soldListings : draftListings

            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle>{category}</CardTitle>
                  <CardDescription>{categoryListings.length} items</CardDescription>
                </CardHeader>
                <CardContent>
                  {categoryListings.length > 0 ? (
                    <div className="space-y-3">
                      {categoryListings.map((listing: any) => (
                        <div
                          key={listing.id}
                          className="flex items-center justify-between p-3 border border-border rounded hover:bg-muted/50"
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold">{listing.title}</h4>
                            <p className="text-sm text-muted-foreground">
                              {listing.category} • {listing.condition}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">₦{listing.price?.toLocaleString()}</p>
                            <Badge className="mt-1">{listing.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-6">No {category.toLowerCase()} yet</p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
