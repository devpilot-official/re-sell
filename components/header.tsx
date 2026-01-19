"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useRouter } from "next/navigation"
import { useState } from "react"

export default function Header({ user }: { user?: any }) {
  const router = useRouter()
  const [isLoggingOut, setIsLoggingOut] = useState(false)

  const handleLogout = async () => {
    setIsLoggingOut(true)
    try {
      const response = await fetch("/auth/logout", { method: "POST" })
      if (response.ok) {
        router.push("/")
        router.refresh()
      }
    } catch (error) {
      console.error("Logout failed:", error)
      setIsLoggingOut(false)
    }
  }

  return (
    <nav className="border-b border-border bg-card sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-2xl font-bold text-primary">
              Preloved
            </Link>
            {user && (
              <div className="hidden md:flex items-center gap-6">
                <Link href="/browse" className="text-sm hover:text-primary transition">
                  Browse
                </Link>
                <Link href="/dashboard/shop" className="text-sm hover:text-primary transition">
                  My Shop
                </Link>
                <Link href="/dashboard/messages" className="text-sm hover:text-primary transition">
                  Messages
                </Link>
              </div>
            )}
          </div>

          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link href="/dashboard/shop">
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    Sell
                  </Button>
                </Link>
                <div className="flex items-center gap-2 px-3 py-2 bg-muted rounded-lg">
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center text-xs font-bold">
                    {user.email?.[0].toUpperCase()}
                  </div>
                  <span className="text-sm hidden sm:inline">{user.email?.split("@")[0]}</span>
                </div>
                <button
                  onClick={handleLogout}
                  disabled={isLoggingOut}
                  className="text-sm text-muted-foreground hover:text-foreground transition disabled:opacity-50"
                >
                  {isLoggingOut ? "Logging out..." : "Logout"}
                </button>
              </>
            ) : (
              <>
                <Link href="/auth/login">
                  <Button variant="outline" size="sm">
                    Login
                  </Button>
                </Link>
                <Link href="/auth/sign-up">
                  <Button size="sm" className="bg-primary hover:bg-primary/90">
                    Sign Up
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
