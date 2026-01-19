import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Header from "@/components/header"
import { Badge } from "@/components/ui/badge"

export default async function PurchasesBreakdownPage() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: purchases } = await supabase
    .from("transactions")
    .select(
      `
      *,
      listing:listings(title, price, category)
    `,
    )
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false })

  const pendingPurchases = purchases?.filter((p) => p.status === "pending") || []
  const completedPurchases = purchases?.filter((p) => p.status === "completed") || []
  const refundedPurchases = purchases?.filter((p) => p.status === "refunded") || []

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">Purchases Breakdown</h1>

        <div className="grid md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Pending Purchases</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-amber-600">{pendingPurchases.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Awaiting fulfillment</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Completed Purchases</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-green-600">{completedPurchases.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Successfully received</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-medium">Refunded Purchases</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold text-red-600">{refundedPurchases.length}</p>
              <p className="text-xs text-muted-foreground mt-1">Refund processed</p>
            </CardContent>
          </Card>
        </div>

        <div className="grid gap-6">
          {["Pending", "Completed", "Refunded"].map((category) => {
            const categoryPurchases =
              category === "Pending"
                ? pendingPurchases
                : category === "Completed"
                  ? completedPurchases
                  : refundedPurchases

            return (
              <Card key={category}>
                <CardHeader>
                  <CardTitle>{category} Purchases</CardTitle>
                  <CardDescription>{categoryPurchases.length} items</CardDescription>
                </CardHeader>
                <CardContent>
                  {categoryPurchases.length > 0 ? (
                    <div className="space-y-3">
                      {categoryPurchases.map((purchase: any) => (
                        <div
                          key={purchase.id}
                          className="flex items-center justify-between p-3 border border-border rounded hover:bg-muted/50"
                        >
                          <div className="flex-1">
                            <h4 className="font-semibold">{purchase.listing?.title}</h4>
                            <p className="text-sm text-muted-foreground">{purchase.listing?.category}</p>
                          </div>
                          <div className="text-right">
                            <p className="font-bold text-primary">₦{purchase.amount?.toLocaleString()}</p>
                            <Badge className="mt-1">{purchase.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-center py-6">No {category.toLowerCase()} purchases</p>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>
    </div>
  )
}
