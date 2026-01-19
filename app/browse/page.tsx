import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import FavoriteButton from "@/components/listings/favorite-button"

export default async function BrowsePage() {
  const supabase = await createClient()

  const { data: listings } = await supabase
    .from("listings")
    .select(`
      *,
      seller:profiles(full_name, seller_rating)
    `)
    .eq("status", "active")
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <Link href="/" className="text-2xl font-bold text-primary">
              Preloved
            </Link>
            <div className="flex items-center gap-4">
              <Link href="/browse" className="text-sm hover:text-primary">
                Browse
              </Link>
              <Link href="/dashboard">
                <Button size="sm" variant="outline">
                  Dashboard
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Main */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold mb-2">Featured Items</h1>
        <p className="text-muted-foreground mb-8">Discover premium preloved fashion from verified sellers</p>

        {listings && listings.length > 0 ? (
          <div className="grid md:grid-cols-3 gap-6">
            {listings.map((listing) => (
              <div key={listing.id} className="relative group">
                <div className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur rounded-full">
                  <FavoriteButton listingId={listing.id} />
                </div>
                <Link href={`/listings/${listing.id}`}>
                  <Card className="border-border/50 hover:shadow-lg transition cursor-pointer h-full">
                    <CardContent className="p-0 h-64 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center rounded-t-lg">
                      <div className="text-center">
                        <div className="text-4xl mb-2">👗</div>
                        <p className="text-xs text-muted-foreground">{listing.category}</p>
                      </div>
                    </CardContent>
                    <div className="p-4">
                      <h3 className="font-bold text-lg line-clamp-2 mb-2">{listing.title}</h3>
                      <p className="text-xs text-muted-foreground mb-3">{listing.brand}</p>
                      <div className="mb-4">
                        <p className="text-2xl font-bold text-primary mb-1">₦{listing.price.toLocaleString()}</p>
                        <p className="text-xs bg-muted px-2 py-1 rounded w-fit">{listing.condition}</p>
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          <p className="font-medium">{listing.seller?.full_name}</p>
                          <p>⭐ {listing.seller?.seller_rating || "New"}</p>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {listing.size && <p>Size: {listing.size}</p>}
                        </div>
                      </div>
                    </div>
                  </Card>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <Card className="border-border/50 text-center py-16">
            <CardContent>
              <p className="text-muted-foreground mb-4 text-lg">No items available yet</p>
              <p className="text-sm text-muted-foreground">Check back soon for new listings!</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
