"use client"

import { useEffect, useState, useMemo } from "react"
import { createClient } from "@/lib/supabase/client"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Filter, SortAsc, X } from "lucide-react"
import FavoriteButton from "./favorite-button"

const CATEGORIES = [
  "All Categories",
  "Fashion",
  "Electronics",
  "Home & Living",
  "Sports",
  "Books & Media",
  "Toys & Games",
  "Beauty",
  "Automotive",
  "Jewelry",
  "Other",
]

const CONDITIONS = ["All Conditions", "New", "Like New", "Good", "Fair"]

const SORT_OPTIONS = [
  { value: "views", label: "Most Viewed" },
  { value: "price_low", label: "Price: Low to High" },
  { value: "price_high", label: "Price: High to Low" },
  { value: "newest", label: "Newest First" },
  { value: "oldest", label: "Oldest First" },
]

export default function TrendingItems() {
  const [listings, setListings] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showFilters, setShowFilters] = useState(false)
  
  // Filter states
  const [selectedCategory, setSelectedCategory] = useState("All Categories")
  const [selectedCondition, setSelectedCondition] = useState("All Conditions")
  const [sortBy, setSortBy] = useState("views")
  const [priceRange, setPriceRange] = useState({ min: "", max: "" })

  useEffect(() => {
    const fetchTrending = async () => {
      const supabase = createClient()
      const { data: trendingListings } = await supabase
        .from("listings")
        .select(`
          *,
          seller:profiles(full_name, seller_rating),
          transactions(id, status)
        `)
        .eq("status", "active")
        .limit(50)

      // Filter out items that have paid transactions
      const filteredListings =
        trendingListings?.filter((listing: any) => {
          const hasPaidTransaction = listing.transactions?.some(
            (t: any) => t.status === "payment made" || t.status === "completed",
          )
          return !hasPaidTransaction
        }) || []

      setListings(filteredListings)
      setIsLoading(false)
    }

    fetchTrending()
  }, [])

  // Apply filters and sorting
  const filteredAndSortedListings = useMemo(() => {
    let result = [...listings]

    // Filter by category
    if (selectedCategory !== "All Categories") {
      result = result.filter((listing) => listing.category === selectedCategory)
    }

    // Filter by condition
    if (selectedCondition !== "All Conditions") {
      result = result.filter((listing) => listing.condition === selectedCondition)
    }

    // Filter by price range
    if (priceRange.min) {
      result = result.filter((listing) => listing.price >= Number(priceRange.min))
    }
    if (priceRange.max) {
      result = result.filter((listing) => listing.price <= Number(priceRange.max))
    }

    // Sort
    switch (sortBy) {
      case "views":
        result.sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
        break
      case "price_low":
        result.sort((a, b) => a.price - b.price)
        break
      case "price_high":
        result.sort((a, b) => b.price - a.price)
        break
      case "newest":
        result.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
        break
      case "oldest":
        result.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
        break
    }

    return result.slice(0, 12)
  }, [listings, selectedCategory, selectedCondition, sortBy, priceRange])

  const clearFilters = () => {
    setSelectedCategory("All Categories")
    setSelectedCondition("All Conditions")
    setSortBy("views")
    setPriceRange({ min: "", max: "" })
  }

  const hasActiveFilters =
    selectedCategory !== "All Categories" ||
    selectedCondition !== "All Conditions" ||
    sortBy !== "views" ||
    priceRange.min ||
    priceRange.max

  if (isLoading) return <p className="text-center py-8 text-muted-foreground">Loading trending items...</p>

  return (
    <div>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold">Trending Now</h2>
        
        <div className="flex items-center gap-2">
          {/* Sort dropdown - always visible */}
          <Select value={sortBy} onValueChange={setSortBy}>
            <SelectTrigger className="w-[160px]">
              <SortAsc className="w-4 h-4 mr-2" />
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              {SORT_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          {/* Filter toggle button */}
          <Button
            variant={showFilters ? "default" : "outline"}
            size="sm"
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center gap-2"
          >
            <Filter className="w-4 h-4" />
            Filters
            {hasActiveFilters && (
              <span className="w-2 h-2 bg-primary rounded-full" />
            )}
          </Button>

          {/* Clear filters button */}
          {hasActiveFilters && (
            <Button
              variant="ghost"
              size="sm"
              onClick={clearFilters}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-4 h-4 mr-1" />
              Clear
            </Button>
          )}
        </div>
      </div>

      {/* Filter panel */}
      {showFilters && (
        <div className="bg-muted/50 border border-border rounded-lg p-4 mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Category filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Category</label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Condition filter */}
          <div>
            <label className="text-sm font-medium mb-2 block">Condition</label>
            <Select value={selectedCondition} onValueChange={setSelectedCondition}>
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                {CONDITIONS.map((condition) => (
                  <SelectItem key={condition} value={condition}>
                    {condition}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Price range */}
          <div>
            <label className="text-sm font-medium mb-2 block">Min Price</label>
            <input
              type="number"
              placeholder="Min"
              value={priceRange.min}
              onChange={(e) => setPriceRange((prev) => ({ ...prev, min: e.target.value }))}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-2 block">Max Price</label>
            <input
              type="number"
              placeholder="Max"
              value={priceRange.max}
              onChange={(e) => setPriceRange((prev) => ({ ...prev, max: e.target.value }))}
              className="w-full px-3 py-2 bg-background border border-border rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>
        </div>
      )}

      {/* Results count */}
      <p className="text-sm text-muted-foreground mb-4">
        Showing {filteredAndSortedListings.length} item{filteredAndSortedListings.length !== 1 ? "s" : ""}
        {hasActiveFilters && " (filtered)"}
      </p>

      {/* Listings grid */}
      {filteredAndSortedListings.length === 0 ? (
        <div className="text-center py-12 bg-muted/30 rounded-lg">
          <p className="text-muted-foreground mb-4">No items match your filters</p>
          <Button variant="outline" onClick={clearFilters}>
            Clear Filters
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredAndSortedListings.map((listing) => (
            <div key={listing.id} className="relative group">
              <div className="absolute top-2 right-2 z-10 bg-background/80 backdrop-blur rounded-full">
                <FavoriteButton listingId={listing.id} />
              </div>
              <Link href={`/listings/${listing.id}`}>
                <Card className="border-border/50 hover:shadow-lg transition cursor-pointer h-full">
                  <CardContent className="p-0 h-36 sm:h-48 bg-gradient-to-br from-primary/10 to-accent/10 flex items-center justify-center rounded-t-lg">
                    <div className="text-center">
                      <div className="text-3xl sm:text-4xl mb-2">
                        {listing.category === "Fashion" && "👗"}
                        {listing.category === "Electronics" && "📱"}
                        {listing.category === "Home & Living" && "🏠"}
                        {listing.category === "Sports" && "⚽"}
                        {listing.category === "Books & Media" && "📚"}
                        {listing.category === "Toys & Games" && "🎮"}
                        {listing.category === "Beauty" && "💄"}
                        {listing.category === "Automotive" && "🚗"}
                        {listing.category === "Jewelry" && "⌚"}
                        {!["Fashion", "Electronics", "Home & Living", "Sports", "Books & Media", "Toys & Games", "Beauty", "Automotive", "Jewelry"].includes(listing.category) && "📦"}
                      </div>
                      <p className="text-xs text-muted-foreground">{listing.category}</p>
                    </div>
                  </CardContent>
                  <div className="p-3 sm:p-4">
                    <h3 className="font-bold text-sm sm:text-base line-clamp-2 mb-2">{listing.title}</h3>
                    <p className="text-sm font-bold text-primary mb-2">₦{listing.price.toLocaleString()}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>👁 {listing.view_count || 0}</span>
                      <span className="bg-muted px-2 py-0.5 rounded">{listing.condition}</span>
                    </div>
                  </div>
                </Card>
              </Link>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
