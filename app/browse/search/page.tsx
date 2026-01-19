"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"

const CATEGORIES = ["All", "Dresses", "Tops", "Bottoms", "Outerwear", "Accessories", "Shoes", "Bags", "Other"]
const CONDITIONS = ["All", "New with Tags", "New Without Tags", "Like New", "Excellent", "Good", "Fair"]

export default function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; category?: string; condition?: string; minPrice?: string; maxPrice?: string }>
}) {
  const [params, setParams] = useState<any>({})
  const [listings, setListings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filters, setFilters] = useState({
    query: "",
    category: "All",
    condition: "All",
    minPrice: "",
    maxPrice: "",
  })

  useEffect(() => {
    searchParams.then((p) => {
      setParams(p)
      setFilters({
        query: p.q || "",
        category: p.category || "All",
        condition: p.condition || "All",
        minPrice: p.minPrice || "",
        maxPrice: p.maxPrice || "",
      })
    })
  }, [searchParams])

  useEffect(() => {
    const fetchListings = async () => {
      const supabase = createClient()
      setIsLoading(true)

      let query = supabase
        .from("listings")
        .select(`
          *,
          seller:profiles(full_name, seller_rating)
        `)
        .eq("status", "active")

      if (filters.query) {
        query = query.or(
          `title.ilike.%${filters.query}%,description.ilike.%${filters.query}%,brand.ilike.%${filters.query}%`,
        )
      }

      if (filters.category !== "All") {
        query = query.eq("category", filters.category)
      }

      if (filters.condition !== "All") {
        query = query.eq("condition", filters.condition)
      }

      if (filters.minPrice) {
        query = query.gte("price", Number.parseFloat(filters.minPrice))
      }

      if (filters.maxPrice) {
        query = query.lte("price", Number.parseFloat(filters.maxPrice))
      }

      const { data } = await query.order("created_at", { ascending: false })
      setListings(data || [])
      setIsLoading(false)
    }

    fetchListings()
  }, [filters])

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value }))
  }

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
        <h1 className="text-3xl font-bold mb-8">Search Results</h1>

        <div className="grid md:grid-cols-4 gap-8">
          {/* Filters */}
          <aside className="md:col-span-1">
            <div className="bg-card border border-border rounded-lg p-6 sticky top-24">
              <h3 className="font-bold mb-4">Filters</h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Search</label>
                  <Input
                    type="text"
                    placeholder="Search items..."
                    value={filters.query}
                    onChange={(e) => handleFilterChange("query", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange("category", e.target.value)}
                    className="w-full px-2 py-2 border border-input rounded-md bg-background text-sm"
                  >
                    {CATEGORIES.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Condition</label>
                  <select
                    value={filters.condition}
                    onChange={(e) => handleFilterChange("condition", e.target.value)}
                    className="w-full px-2 py-2 border border-input rounded-md bg-background text-sm"
                  >
                    {CONDITIONS.map((cond) => (
                      <option key={cond} value={cond}>
                        {cond}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Price Range (NGN)</label>
                  <Input
                    type="number"
                    placeholder="Min"
                    value={filters.minPrice}
                    onChange={(e) => handleFilterChange("minPrice", e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Max"
                    value={filters.maxPrice}
                    onChange={(e) => handleFilterChange("maxPrice", e.target.value)}
                  />
                </div>

                <Button
                  className="w-full bg-primary hover:bg-primary/90"
                  onClick={() =>
                    setFilters({
                      query: "",
                      category: "All",
                      condition: "All",
                      minPrice: "",
                      maxPrice: "",
                    })
                  }
                >
                  Clear Filters
                </Button>
              </div>
            </div>
          </aside>

          {/* Results */}
          <div className="md:col-span-3">
            {isLoading ? (
              <p className="text-center py-12 text-muted-foreground">Loading...</p>
            ) : listings.length > 0 ? (
              <>
                <p className="text-sm text-muted-foreground mb-6">
                  Found {listings.length} item{listings.length !== 1 ? "s" : ""}
                </p>
                <div className="grid md:grid-cols-2 gap-6">
                  {listings.map((listing) => (
                    <Link key={listing.id} href={`/listings/${listing.id}`}>
                      <Card className="border-border/50 hover:shadow-lg transition cursor-pointer h-full">
                        <CardContent className="p-0 h-48 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center rounded-t-lg">
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
                          <div className="flex items-center justify-between text-xs">
                            <div className="text-muted-foreground">
                              <p className="font-medium">{listing.seller?.full_name}</p>
                              <p>⭐ {listing.seller?.seller_rating || "New"}</p>
                            </div>
                          </div>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </>
            ) : (
              <Card className="border-border/50 text-center py-16">
                <CardContent>
                  <p className="text-muted-foreground mb-4 text-lg">No items found</p>
                  <p className="text-sm text-muted-foreground mb-6">Try adjusting your filters or search terms</p>
                  <Link href="/browse">
                    <Button variant="outline">Browse All Items</Button>
                  </Link>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
