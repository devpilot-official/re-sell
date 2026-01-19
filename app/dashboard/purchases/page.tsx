import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import Header from "@/components/header"

const ORDER_STATUSES = [
  { id: "payment_made", label: "Payment Made", icon: "💳" },
  { id: "buyer_received_order", label: "Order Received", icon: "📦" },
  { id: "buyer_processing", label: "Processing", icon: "⚙️" },
  { id: "buyer_sent_order", label: "Sent Back", icon: "📤" },
  { id: "courier_received", label: "Courier Received", icon: "🚚" },
  { id: "out_for_delivery", label: "Out for Delivery", icon: "🚛" },
  { id: "delivered", label: "Delivered", icon: "✅" },
]

export default async function PurchasesPage() {
  const supabase = await createClient()
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser()

  if (userError || !user) {
    redirect("/auth/login")
  }

  const { data: purchases } = await supabase
    .from("transactions")
    .select(
      `
      *,
      listing:listings(title, price, category, id),
      seller:profiles(full_name, seller_rating, id)
    `,
    )
    .eq("buyer_id", user.id)
    .order("created_at", { ascending: false })

  const getStatusIndex = (statusId: string) => {
    return ORDER_STATUSES.findIndex((s) => s.id === statusId)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header user={user} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold mb-8">My Purchases</h1>

        {purchases && purchases.length > 0 ? (
          <div className="grid gap-4">
            {purchases.map((purchase: any) => {
              const currentStatusIndex = getStatusIndex(purchase.order_status || "payment_made")
              return (
                <Card key={purchase.id} className="border-border/50 hover:shadow-md transition">
                  <CardContent className="p-6">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="font-bold text-lg mb-1">{purchase.listing?.title}</h3>
                        <p className="text-sm text-muted-foreground">From: {purchase.seller?.full_name}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-primary">₦{purchase.amount.toLocaleString()}</p>
                        <p className="text-xs text-muted-foreground">{purchase.payment_method}</p>
                      </div>
                    </div>

                    <div className="grid md:grid-cols-4 gap-4 mb-6 py-4 border-t border-b border-border">
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Payment Status</p>
                        <p className="font-medium capitalize">{purchase.status}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Reference</p>
                        <p className="font-mono text-xs">{purchase.payment_reference}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Category</p>
                        <p className="text-sm">{purchase.listing?.category}</p>
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground mb-1">Date</p>
                        <p className="text-sm">{new Date(purchase.created_at).toLocaleDateString()}</p>
                      </div>
                    </div>

                    <div className="mb-6">
                      <p className="text-sm font-semibold mb-3">Order Progress</p>
                      <div className="flex items-center gap-1">
                        {ORDER_STATUSES.map((status, index) => (
                          <div key={status.id} className="flex items-center flex-1">
                            <div
                              className={`flex-1 h-2 rounded-full transition ${
                                index <= currentStatusIndex ? "bg-primary" : "bg-muted"
                              }`}
                            />
                            {index < ORDER_STATUSES.length - 1 && (
                              <div
                                className={`w-2 h-2 rounded-full mx-1 ${index < currentStatusIndex ? "bg-primary" : "bg-muted"}`}
                              />
                            )}
                          </div>
                        ))}
                      </div>
                      <div className="mt-2 flex items-center gap-2">
                        <span className="text-sm">
                          {ORDER_STATUSES[currentStatusIndex].icon} {ORDER_STATUSES[currentStatusIndex].label}
                        </span>
                      </div>
                    </div>

                    {purchase.tracking_number && (
                      <div className="mb-4 p-3 bg-muted/50 rounded">
                        <p className="text-xs text-muted-foreground mb-1">Tracking Number</p>
                        <p className="font-mono font-semibold">{purchase.tracking_number}</p>
                        <p className="text-xs text-muted-foreground mt-1">Carrier: {purchase.carrier}</p>
                      </div>
                    )}

                    <div className="flex gap-2">
                      <Link href={`/dashboard/messages?listing=${purchase.listing?.id}`}>
                        <Button size="sm" variant="outline">
                          Message Seller
                        </Button>
                      </Link>
                      {purchase.order_status === "payment_made" && (
                        <Button size="sm" className="bg-primary hover:bg-primary/90">
                          Confirm Receipt
                        </Button>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        ) : (
          <Card className="border-border/50 text-center py-12">
            <CardContent>
              <p className="text-muted-foreground mb-4 text-lg">No purchases yet</p>
              <Link href="/browse">
                <Button className="bg-primary hover:bg-primary/90">Start Shopping</Button>
              </Link>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
