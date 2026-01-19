import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Header from "@/components/header"

export default async function DashboardPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const [{ data: profile }, { data: recommendations }, { data: userTransactions }, { data: userListings }] =
    await Promise.all([
      supabase.from("profiles").select("*").eq("id", user.id).single(),
      supabase.from("listings").select("*").eq("status", "active").limit(6).order("view_count", { ascending: false }),
      supabase
        .from("transactions")
        .select("*")
        .eq("buyer_id", user.id)
        .order("created_at", { ascending: false })
        .limit(5),
      supabase.from("listings").select("*").eq("seller_id", user.id).eq("status", "active").limit(5),
    ])

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <Link href="/dashboard/account-details">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Account Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-2xl font-bold">{profile?.full_name || "User"}</p>
                    <Badge variant={profile?.verified ? "default" : "secondary"}>
                      {profile?.verified ? "Verified" : "Not Verified"}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/listings-breakdown">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Active Listings</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary">{userListings?.length || 0}</span>
                    <span className="text-xs text-muted-foreground">items for sale</span>
                  </div>
                </CardContent>
              </Card>
            </Link>

            <Link href="/dashboard/purchases-breakdown">
              <Card className="cursor-pointer hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="text-sm font-medium">Total Purchases</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-bold text-primary">{userTransactions?.length || 0}</span>
                    <span className="text-xs text-muted-foreground">completed</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          </div>

          <div className="flex gap-4 flex-wrap">
            <Link href="/browse">
              <Button size="lg" className="bg-primary hover:bg-primary/90">
                Browse Marketplace
              </Button>
            </Link>
            <Link href="/dashboard/shop">
              <Button size="lg" variant="outline">
                Go to My Shop
              </Button>
            </Link>
            <Link href="/dashboard/profile">
              <Button size="lg" variant="outline">
                Profile Settings
              </Button>
            </Link>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {/* Sidebar */}
          <aside className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <Link href="/dashboard/shop">
                  <Button className="w-full bg-primary hover:bg-primary/90 justify-start">+ List New Item</Button>
                </Link>
                <Link href="/dashboard/messages">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Messages
                  </Button>
                </Link>
                <Link href="/dashboard/purchases">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    My Purchases
                  </Button>
                </Link>
                <Link href="/dashboard/sales">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    My Sales
                  </Button>
                </Link>
                <Link href="/dashboard/favorites">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Favorites
                  </Button>
                </Link>
                <Link href="/dashboard/profile">
                  <Button variant="outline" className="w-full justify-start bg-transparent">
                    Settings
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </aside>

          {/* Main Content */}
          <div className="md:col-span-2 space-y-8">
            {/* Trending Items */}
            <Card>
              <CardHeader>
                <CardTitle>Recommended For You</CardTitle>
                <CardDescription>Items trending in your favorite categories</CardDescription>
              </CardHeader>
              <CardContent>
                {recommendations && recommendations.length > 0 ? (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {recommendations.map((listing: any) => (
                      <Link key={listing.id} href={`/listings/${listing.id}`}>
                        <div className="bg-muted rounded-lg p-3 hover:shadow-md transition cursor-pointer h-full">
                          <div className="bg-gradient-to-br from-primary/10 to-accent/10 h-32 rounded flex items-center justify-center mb-2">
                            <span className="text-2xl">📦</span>
                          </div>
                          <h4 className="font-semibold text-sm line-clamp-2 mb-1">{listing.title}</h4>
                          <p className="text-xs text-muted-foreground mb-2">{listing.category}</p>
                          <p className="font-bold text-primary">₦{listing.price?.toLocaleString()}</p>
                        </div>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No recommendations yet</p>
                )}
              </CardContent>
            </Card>

            {/* Recent Purchases */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Purchases</CardTitle>
                <CardDescription>Your latest buying activity</CardDescription>
              </CardHeader>
              <CardContent>
                {userTransactions && userTransactions.length > 0 ? (
                  <div className="space-y-3">
                    {userTransactions.map((transaction: any) => (
                      <div
                        key={transaction.id}
                        className="flex items-center justify-between p-3 border border-border rounded hover:bg-muted/50"
                      >
                        <div>
                          <p className="font-medium text-sm">Transaction #{transaction.id.slice(0, 8)}</p>
                          <p className="text-xs text-muted-foreground">
                            {new Date(transaction.created_at).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge variant={transaction.status === "completed" ? "default" : "secondary"}>
                          {transaction.status}
                        </Badge>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-center py-8">No purchases yet</p>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}
