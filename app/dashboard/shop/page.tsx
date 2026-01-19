import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Header from "@/components/header"
import { Badge } from "@/components/ui/badge"

export default async function ShopPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const [{ data: profile }, { data: listings }, { data: sales }] = await Promise.all([
    supabase.from("profiles").select("*").eq("id", user.id).single(),
    supabase.from("listings").select("*").eq("seller_id", user.id).order("created_at", { ascending: false }),
    supabase.from("transactions").select("*, listing:listings(*)").eq("seller_id", user.id).eq("status", "completed"),
  ])

  const totalEarnings = sales?.reduce((sum: number, sale: any) => sum + (sale.listing?.price || 0), 0) || 0
  const activeListing = listings?.filter((l: any) => l.status === "active").length || 0

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <aside className="md:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Shop Stats</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Active Listings</p>
                  <p className="text-3xl font-bold text-primary">{activeListing}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Total Earnings</p>
                  <p className="text-3xl font-bold text-primary">₦{totalEarnings?.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-sm text-muted-foreground mb-1">Seller Rating</p>
                  <p className="text-3xl font-bold text-primary">{profile?.seller_rating || "New"}</p>
                </div>
              </CardContent>
            </Card>

            <Link href="/dashboard/sell">
              <Button className="w-full bg-primary hover:bg-primary/90 h-12">+ List New Item</Button>
            </Link>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Links</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/dashboard/profile">
                  <Button variant="ghost" className="w-full justify-start">
                    Profile Settings
                  </Button>
                </Link>
                <Link href="/dashboard/purchases">
                  <Button variant="ghost" className="w-full justify-start">
                    My Purchases
                  </Button>
                </Link>
                <Link href="/dashboard/messages">
                  <Button variant="ghost" className="w-full justify-start">
                    Messages
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Active Listings */}
            <Card>
              <CardHeader>
                <CardTitle>My Listings</CardTitle>
                <CardDescription>Items you've listed for sale</CardDescription>
              </CardHeader>
              <CardContent>
                {listings && listings.length > 0 ? (
                  <div className="space-y-4">
                    {listings.map((listing: any) => (
                      <div
                        key={listing.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{listing.title}</h4>
                          <p className="text-sm text-muted-foreground mb-2">
                            {listing.category} • {listing.condition}
                          </p>
                          <div className="flex gap-2">
                            <Badge variant={listing.status === "active" ? "default" : "secondary"}>
                              {listing.status}
                            </Badge>
                            <span className="text-sm font-semibold text-primary">
                              ₦{listing.price?.toLocaleString()}
                            </span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/listings/${listing.id}`}>
                            <Button variant="outline" size="sm">
                              View
                            </Button>
                          </Link>
                          <Button variant="outline" size="sm">
                            Edit
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground mb-4">No listings yet</p>
                    <Link href="/dashboard/sell">
                      <Button className="bg-primary hover:bg-primary/90">Create Your First Listing</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Recent Sales */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Sales</CardTitle>
                <CardDescription>Items you've sold</CardDescription>
              </CardHeader>
              <CardContent>
                {sales && sales.length > 0 ? (
                  <div className="space-y-4">
                    {sales.map((sale: any) => (
                      <div
                        key={sale.id}
                        className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition"
                      >
                        <div className="flex-1">
                          <h4 className="font-semibold mb-1">{sale.listing?.title}</h4>
                          <p className="text-sm text-muted-foreground">
                            Sold on {new Date(sale.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-semibold text-primary">₦{sale.listing?.price?.toLocaleString()}</p>
                          <Badge variant="outline" className="mt-1">
                            Completed
                          </Badge>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-12">
                    <p className="text-muted-foreground">No sales yet</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
