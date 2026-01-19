import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import Header from "@/components/header"
import FavoriteButton from "@/components/listings/favorite-button"

export default async function FavoritesPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect("/auth/login")
  }

  const { data: favorites } = await supabase
    .from("favorites")
    .select(
      `
      *,
      listing:listings(id, title, price, category, condition, seller_id, created_at),
      seller:profiles!listings(full_name, seller_rating)
    `,
    )
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Favorites</h1>
            <p className="text-muted-foreground mt-1">Items you've saved for later</p>
          </div>
          <Link href="/browse">
            <Button className="bg-primary hover:bg-primary/90">Browse More</Button>
          </Link>
        </div>

        {favorites && favorites.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {favorites.map((favorite: any) => (
              <div key={favorite.id} className="relative group">
                <div className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur rounded-full">
                  <FavoriteButton listingId={favorite.listing?.id} />
                </div>
                <Card className="border-border/50 hover:shadow-lg transition overflow-hidden h-full">
                  <div className="bg-gradient-to-br from-primary/10 to-accent/10 h-40 flex items-center justify-center">
                    <span className="text-4xl">📦</span>
                  </div>
                  <CardContent className="p-4">
                    <Link href={`/listings/${favorite.listing?.id}`}>
                      <h3 className="font-semibold text-sm line-clamp-2 hover:text-primary mb-1">
                        {favorite.listing?.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-muted-foreground mb-2">{favorite.listing?.category}</p>
                    <p className="font-bold text-primary text-lg">₦{favorite.listing?.price?.toLocaleString()}</p>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        ) : (
          <Card className="border-border/50 text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4 text-lg">No favorite items yet</p>
              <p className="text-sm text-muted-foreground mb-6">
                Browse the marketplace and add items to your favorites to see them here
              </p>
              <Link href="/browse">
                <Button className="bg-primary hover:bg-primary/90">Start Browsing</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
