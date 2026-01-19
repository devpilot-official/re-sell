import type React from "react"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/admin-login")
  }

  const { data: profile } = await supabase.from("profiles").select("admin_role").eq("id", user.id).single()

  if (profile?.admin_role !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="flex h-screen bg-background">
      <aside className="w-64 border-r border-border p-6 space-y-8 overflow-y-auto">
        <div>
          <h1 className="text-2xl font-bold text-primary">Preloved Admin</h1>
          <p className="text-xs text-muted-foreground">Management Console</p>
        </div>

        <nav className="space-y-1">
          <div className="px-2 py-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Platform</p>
          </div>
          <Link href="/admin">
            <Button variant="ghost" className="w-full justify-start">
              Dashboard
            </Button>
          </Link>

          <div className="px-2 py-2 mt-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Management</p>
          </div>
          <Link href="/admin/users">
            <Button variant="ghost" className="w-full justify-start">
              Users
            </Button>
          </Link>
          <Link href="/admin/listings">
            <Button variant="ghost" className="w-full justify-start">
              Listings
            </Button>
          </Link>
          <Link href="/admin/transactions">
            <Button variant="ghost" className="w-full justify-start">
              Transactions
            </Button>
          </Link>

          <div className="px-2 py-2 mt-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Operations</p>
          </div>
          <Link href="/admin/moderation">
            <Button variant="ghost" className="w-full justify-start">
              Moderation Queue
            </Button>
          </Link>
          <Link href="/admin/disputes">
            <Button variant="ghost" className="w-full justify-start">
              Disputes
            </Button>
          </Link>
          <Link href="/admin/promotions">
            <Button variant="ghost" className="w-full justify-start">
              Promotions
            </Button>
          </Link>

          <div className="px-2 py-2 mt-6">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-3">Compliance</p>
          </div>
          <Link href="/admin/audit-logs">
            <Button variant="ghost" className="w-full justify-start">
              Audit Logs
            </Button>
          </Link>
        </nav>

        <div className="pt-8 border-t border-border space-y-2">
          <Link href="/dashboard">
            <Button variant="outline" className="w-full bg-transparent justify-start">
              Back to Dashboard
            </Button>
          </Link>
          <form action="/auth/logout" method="POST">
            <Button
              type="submit"
              variant="ghost"
              className="w-full justify-start text-destructive hover:text-destructive"
            >
              Logout
            </Button>
          </form>
        </div>
      </aside>

      <main className="flex-1 overflow-auto p-8">{children}</main>
    </div>
  )
}
