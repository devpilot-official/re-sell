import { createClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import ListingActions from "@/components/listings/listing-actions"
import FavoriteButton from "@/components/listings/favorite-button"

export default async function ListingDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  const { data: listing } = await supabase
    .from("listings")
    .select(`
      *,
      seller:profiles(id, full_name, bio, seller_rating, total_sales, verified)
    `)
    .eq("id", id)
    .single()

  if (!listing) {
    notFound()
  }

  await supabase
    .from("listings")
    .update({ view_count: (listing.view_count || 0) + 1 })
    .eq("id", id)

  return (
    <div className="min-h-screen bg-background">
      {/* Navigation */}
      <nav className="border-b border-border bg-card">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <Link href="/" className="text-2xl font-bold text-primary">
            Preloved
          </Link>
          <div className="flex gap-4">
            <Link href="/browse" className="text-sm hover:text-primary">
              Back to Browse
            </Link>
            <Link href="/dashboard">
              <Button size="sm" variant="outline">
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Main */}
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8">
          {/* Image */}
          <div className="md:col-span-1">
            <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-lg h-80 flex items-center justify-center mb-4">
              <div className="text-center">
                <div className="text-6xl mb-2">👗</div>
                <p className="text-sm text-muted-foreground">{listing.category}</p>
              </div>
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-2">
            <div className="mb-6 flex justify-between items-start">
              <div>
                <h1 className="text-3xl font-bold mb-2">{listing.title}</h1>
                <div className="flex gap-4 mb-4 text-sm text-muted-foreground">
                  <span>{listing.brand}</span>
                  <span>•</span>
                  <span>Size: {listing.size || "N/A"}</span>
                  <span>•</span>
                  <span>{listing.condition}</span>
                </div>
                <p className="text-xl font-bold text-primary mb-4">₦{listing.price.toLocaleString()}</p>
              </div>
              {/* Favorite Button */}
              <FavoriteButton listingId={listing.id} />
            </div>

            {/* Description */}
            <Card className="border-border/50 mb-6">
              <CardHeader>
                <CardTitle>Description</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="whitespace-pre-wrap text-sm">{listing.description}</p>
              </CardContent>
            </Card>

            {/* Seller */}
            <Card className="border-border/50 mb-6">
              <CardHeader>
                <CardTitle>About the Seller</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold mb-1">{listing.seller?.full_name}</h3>
                    <p className="text-sm text-muted-foreground mb-3">{listing.seller?.bio}</p>
                    <div className="space-y-1 text-sm">
                      <p>
                        <span className="text-muted-foreground">Rating:</span>{" "}
                        <span className="font-bold">⭐ {listing.seller?.seller_rating || "New Seller"}</span>
                      </p>
                      <p>
                        <span className="text-muted-foreground">Total Sales:</span>{" "}
                        <span className="font-bold">{listing.seller?.total_sales}</span>
                      </p>
                      {listing.seller?.verified && <p className="text-primary text-xs">✓ Verified Seller</p>}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <ListingActions listingId={listing.id} sellerId={listing.seller?.id} />
          </div>
        </div>
      </div>
    </div>
  )
}
