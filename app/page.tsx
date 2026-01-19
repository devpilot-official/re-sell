"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import SearchBar from "@/components/search-bar"
import TrendingItems from "@/components/listings/trending-items"
import Header from "@/components/header"
import { useEffect, useState } from "react"
import { createBrowserClient } from "@supabase/ssr"

export default function HomePage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    )

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user)
      setLoading(false)
    })
  }, [])

  if (loading) return null

  return (
    <main className="min-h-screen bg-gradient-to-br from-background to-muted">
      <Header user={user} />

      {/* Hero */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="grid md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h1 className="text-5xl font-bold text-foreground mb-6">Buy and Sell Anything Second-Hand</h1>
            <p className="text-xl text-muted-foreground mb-8">
              Discover authentic pre-owned items across fashion, electronics, home & living, and more. Secure, verified,
              and rewarding marketplace for conscious shoppers.
            </p>
            <div className="flex gap-4">
              {!user ? (
                <>
                  <Link href="/auth/sign-up">
                    <Button size="lg" className="bg-primary hover:bg-primary/90">
                      Get Started
                    </Button>
                  </Link>
                  <Link href="/browse">
                    <Button size="lg" variant="outline">
                      Browse Items
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard">
                    <Button size="lg" className="bg-primary hover:bg-primary/90">
                      Go to Dashboard
                    </Button>
                  </Link>
                  <Link href="/browse">
                    <Button size="lg" variant="outline">
                      Browse Marketplace
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
          <div className="bg-gradient-to-br from-primary/20 to-accent/20 rounded-lg h-96 flex items-center justify-center">
            <div className="text-center space-y-4">
              <div className="text-6xl space-x-2">
                <span>👗</span>
                <span>📱</span>
                <span>🏠</span>
                <span>⚽</span>
              </div>
              <p className="text-muted-foreground">Multi-Category Marketplace</p>
            </div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="mb-16">
          <SearchBar />
        </div>

        {/* Trending Items */}
        <div className="mb-16">
          <TrendingItems />
        </div>
      </div>

      {/* Features */}
      <div className="bg-card border-t border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold mb-12 text-center">Why Preloved Market?</h2>
          <div className="grid md:grid-cols-4 gap-8">
            <div className="p-6 border border-border rounded-lg hover:shadow-lg transition">
              <div className="text-4xl mb-4">🔐</div>
              <h3 className="font-bold text-lg mb-2">Enterprise Security</h3>
              <p className="text-muted-foreground">AML/KYC compliance, encrypted payments, fraud detection</p>
            </div>
            <div className="p-6 border border-border rounded-lg hover:shadow-lg transition">
              <div className="text-4xl mb-4">🌍</div>
              <h3 className="font-bold text-lg mb-2">Multi-Language & Currency</h3>
              <p className="text-muted-foreground">Support for 8+ languages and multiple payment methods</p>
            </div>
            <div className="p-6 border border-border rounded-lg hover:shadow-lg transition">
              <div className="text-4xl mb-4">✓</div>
              <h3 className="font-bold text-lg mb-2">Verified Sellers</h3>
              <p className="text-muted-foreground">All sellers verified and rated by the community</p>
            </div>
            <div className="p-6 border border-border rounded-lg hover:shadow-lg transition">
              <div className="text-4xl mb-4">💳</div>
              <h3 className="font-bold text-lg mb-2">Multiple Payment Methods</h3>
              <p className="text-muted-foreground">Cards, bank transfers, USSD, mobile money, crypto</p>
            </div>
          </div>
        </div>
      </div>

      {/* Categories */}
      <div className="bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <h2 className="text-3xl font-bold mb-12 text-center">Shop by Category</h2>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            {[
              { name: "Fashion", icon: "👗" },
              { name: "Electronics", icon: "📱" },
              { name: "Home & Living", icon: "🏠" },
              { name: "Sports", icon: "⚽" },
              { name: "Books & Media", icon: "📚" },
              { name: "Toys & Games", icon: "🎮" },
              { name: "Beauty", icon: "💄" },
              { name: "Automotive", icon: "🚗" },
              { name: "Jewelry", icon: "⌚" },
              { name: "Other", icon: "📦" },
            ].map((category) => (
              <Link key={category.name} href={`/browse/search?category=${category.name}`}>
                <div className="p-6 border border-border rounded-lg hover:bg-muted cursor-pointer transition text-center">
                  <div className="text-4xl mb-2">{category.icon}</div>
                  <p className="font-medium text-sm">{category.name}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
